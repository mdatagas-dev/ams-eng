import { createHash, randomUUID } from "node:crypto"
import { Router } from "express"

import {
  ActivityType,
  AssetCategory,
  AssetCondition,
  Prisma,
  StockItemStatus,
  StockMovementType,
} from "./generated/prisma/client.js"
import { prisma } from "./db.js"
import { ApiError, has, input, integer, oneOf, text, uuid } from "./input.js"

export const publicInventoryRoutes = Router()
export const inventoryRoutes = Router()

const assetCategories = Object.values(AssetCategory)
const stockStatuses = Object.values(StockItemStatus)

function cabinetCode(body: Record<string, unknown>) {
  const code = text(body, "code", 20).toUpperCase()
  if (!/^[A-Z0-9-]+$/.test(code)) {
    throw new ApiError(
      400,
      "code may contain only letters, numbers, and hyphens"
    )
  }
  return code
}

inventoryRoutes.get("/cabinets", async (_request, response) => {
  response.json(
    await prisma.cabinet.findMany({
      orderBy: [{ isStaging: "asc" }, { code: "asc" }],
    })
  )
})

inventoryRoutes.get("/", async (_request, response) => {
  const [cabinets, items, movements] = await Promise.all([
    prisma.cabinet.findMany({
      include: { _count: { select: { assets: true } } },
      orderBy: [{ isStaging: "asc" }, { code: "asc" }],
    }),
    prisma.stockItem.findMany({
      include: {
        stocks: {
          include: {
            cabinet: { select: { id: true, code: true, name: true } },
          },
          orderBy: { cabinet: { code: "asc" } },
        },
      },
      orderBy: [{ status: "asc" }, { name: "asc" }, { sourceRow: "asc" }],
    }),
    prisma.stockMovement.findMany({
      include: {
        item: { select: { name: true } },
        cabinet: { select: { code: true, name: true } },
        borrowerDepartment: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  response.json({ cabinets, items, movements })
})

inventoryRoutes.post("/cabinets", async (request, response) => {
  const body = input(request.body)
  const cabinet = await prisma.cabinet.create({
    data: { code: cabinetCode(body), name: text(body, "name", 100) },
  })
  response.status(201).json(cabinet)
})

inventoryRoutes.patch("/cabinets/:id", async (request, response) => {
  const id = uuid(request.params.id)
  const body = input(request.body)
  const existing = await prisma.cabinet.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Cabinet not found")
  if (existing.isStaging) {
    throw new ApiError(400, "The staging cabinet cannot be changed")
  }

  const data: Prisma.CabinetUpdateInput = {}
  if (has(body, "code")) data.code = cabinetCode(body)
  if (has(body, "name")) data.name = text(body, "name", 100)
  if (has(body, "active")) {
    if (typeof body.active !== "boolean") {
      throw new ApiError(400, "active must be a boolean")
    }
    data.active = body.active
  }
  if (!Object.keys(data).length) {
    throw new ApiError(400, "At least one cabinet field must be provided")
  }

  response.json(await prisma.cabinet.update({ where: { id }, data }))
})

inventoryRoutes.patch("/items/:id/status", async (request, response) => {
  const id = uuid(request.params.id)
  const body = input(request.body)
  const status = oneOf(body, "status", stockStatuses)
  response.json(
    await prisma.stockItem.update({ where: { id }, data: { status } })
  )
})

inventoryRoutes.post("/transfers", async (request, response) => {
  const body = input(request.body)
  const itemId = uuid(body.itemId, "itemId")
  const fromCabinetId = uuid(body.fromCabinetId, "fromCabinetId")
  const toCabinetId = uuid(body.toCabinetId, "toCabinetId")
  const goodQuantity = integer(body, "goodQuantity", 0, 100_000)
  const badQuantity = integer(body, "badQuantity", 0, 100_000)
  if (fromCabinetId === toCabinetId) {
    throw new ApiError(400, "Source and destination cabinets must differ")
  }
  if (!goodQuantity && !badQuantity) {
    throw new ApiError(400, "Transfer at least one item")
  }

  await prisma.$transaction(
    async (transaction) => {
      const source = await transaction.cabinetStock.updateMany({
        where: {
          cabinetId: fromCabinetId,
          itemId,
          goodQuantity: { gte: goodQuantity },
          badQuantity: { gte: badQuantity },
        },
        data: {
          goodQuantity: { decrement: goodQuantity },
          badQuantity: { decrement: badQuantity },
        },
      })
      if (!source.count) {
        throw new ApiError(409, "The source cabinet does not have enough stock")
      }

      await transaction.cabinetStock.upsert({
        where: { cabinetId_itemId: { cabinetId: toCabinetId, itemId } },
        update: {
          goodQuantity: { increment: goodQuantity },
          badQuantity: { increment: badQuantity },
        },
        create: { cabinetId: toCabinetId, itemId, goodQuantity, badQuantity },
      })

      await transaction.stockMovement.createMany({
        data: [
          {
            id: randomUUID(),
            type: StockMovementType.TRANSFER,
            itemId,
            cabinetId: fromCabinetId,
            goodDelta: -goodQuantity,
            badDelta: -badQuantity,
            actorName: request.auth!.name,
            metadata: { toCabinetId },
          },
          {
            id: randomUUID(),
            type: StockMovementType.TRANSFER,
            itemId,
            cabinetId: toCabinetId,
            goodDelta: goodQuantity,
            badDelta: badQuantity,
            actorName: request.auth!.name,
            metadata: { fromCabinetId },
          },
        ],
      })
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )

  response.status(204).end()
})

inventoryRoutes.post("/adjustments", async (request, response) => {
  const body = input(request.body)
  const itemId = uuid(body.itemId, "itemId")
  const cabinetId = uuid(body.cabinetId, "cabinetId")
  const goodDelta = integer(body, "goodDelta", -100_000, 100_000)
  const badDelta = integer(body, "badDelta", -100_000, 100_000)
  const note = text(body, "note", 500)
  if (!goodDelta && !badDelta) {
    throw new ApiError(400, "Adjustment must change stock")
  }

  await prisma.$transaction(
    async (transaction) => {
      await transaction.cabinetStock.upsert({
        where: { cabinetId_itemId: { cabinetId, itemId } },
        update: {},
        create: { cabinetId, itemId },
      })
      const result = await transaction.cabinetStock.updateMany({
        where: {
          cabinetId,
          itemId,
          goodQuantity: { gte: Math.max(0, -goodDelta) },
          badQuantity: { gte: Math.max(0, -badDelta) },
        },
        data: {
          goodQuantity: { increment: goodDelta },
          badQuantity: { increment: badDelta },
        },
      })
      if (!result.count) {
        throw new ApiError(409, "Adjustment would make stock negative")
      }
      await transaction.stockMovement.create({
        data: {
          type: StockMovementType.ADJUSTMENT,
          itemId,
          cabinetId,
          goodDelta,
          badDelta,
          actorName: request.auth!.name,
          metadata: { note },
        },
      })
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )

  response.status(204).end()
})

publicInventoryRoutes.get("/cabinets/:id", async (request, response) => {
  const id = uuid(request.params.id)
  const cabinet = await prisma.cabinet.findUnique({
    where: { id },
    select: { id: true, code: true, name: true, active: true, isStaging: true },
  })
  if (!cabinet || !cabinet.active || cabinet.isStaging) {
    throw new ApiError(404, "Cabinet checkout is unavailable")
  }

  const [stocks, availableAssets, departments] = await Promise.all([
    prisma.cabinetStock.findMany({
      where: {
        cabinetId: id,
        goodQuantity: { gt: 0 },
        item: { status: StockItemStatus.CONSUMABLE },
      },
      select: {
        itemId: true,
        goodQuantity: true,
        item: { select: { name: true, specification: true, sourceRow: true } },
      },
      orderBy: { item: { name: "asc" } },
    }),
    prisma.asset.findMany({
      where: {
        cabinetId: id,
        condition: AssetCondition.GOOD,
        loans: { none: { returnedAt: null } },
      },
      select: { category: true, name: true, ownerDepartmentId: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.department.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])
  const assetGroups = new Map<
    string,
    {
      kind: "DURABLE"
      category: AssetCategory
      name: string
      specification: null
      available: number
      ownerDepartmentCounts: Map<string, number>
    }
  >()
  for (const asset of availableAssets) {
    const key = `${asset.category}\0${asset.name}`
    const group = assetGroups.get(key)
    if (group) {
      group.available += 1
      group.ownerDepartmentCounts.set(
        asset.ownerDepartmentId,
        (group.ownerDepartmentCounts.get(asset.ownerDepartmentId) ?? 0) + 1
      )
    } else {
      assetGroups.set(key, {
        kind: "DURABLE",
        category: asset.category,
        name: asset.name,
        specification: null,
        available: 1,
        ownerDepartmentCounts: new Map([[asset.ownerDepartmentId, 1]]),
      })
    }
  }

  response.json({
    cabinet: { id: cabinet.id, code: cabinet.code, name: cabinet.name },
    departments,
    items: [
      ...stocks.map((stock) => ({
        kind: "CONSUMABLE" as const,
        itemId: stock.itemId,
        sourceRow: stock.item.sourceRow,
        name: stock.item.name,
        specification: stock.item.specification,
        available: stock.goodQuantity,
      })),
      ...Array.from(assetGroups.values(), (group) => ({
        kind: group.kind,
        category: group.category,
        name: group.name,
        specification: group.specification,
        available: group.available,
        availableByDepartment: Object.fromEntries(
          departments.map((department) => [
            department.id,
            group.available -
              (group.ownerDepartmentCounts.get(department.id) ?? 0),
          ])
        ),
      })),
    ],
  })
})

publicInventoryRoutes.post(
  "/cabinets/:id/checkout",
  async (request, response) => {
    const cabinetId = uuid(request.params.id)
    const body = input(request.body)
    const checkoutId = uuid(body.checkoutId, "checkoutId")
    const kind = oneOf(body, "kind", ["CONSUMABLE", "DURABLE"] as const)
    const quantity = integer(body, "quantity", 1, 100_000)
    const responsiblePerson = text(body, "responsiblePerson", 150)
    const borrowerDepartmentId = uuid(
      body.borrowerDepartmentId,
      "borrowerDepartmentId"
    )
    const purpose = text(body, "purpose", 250)
    const destinationLocation = text(body, "destinationLocation", 150)
    const selection =
      kind === "CONSUMABLE"
        ? { kind, itemId: uuid(body.itemId, "itemId") }
        : {
            kind,
            category: oneOf(body, "category", assetCategories),
            name: text(body, "name", 150),
          }
    const fingerprint = createHash("sha256")
      .update(
        JSON.stringify({
          cabinetId,
          kind,
          quantity,
          responsiblePerson,
          borrowerDepartmentId,
          purpose,
          destinationLocation,
          selection,
        })
      )
      .digest("hex")

    const result = await prisma.$transaction(
      async (transaction) => {
        const previous = await transaction.checkoutRequest.findUnique({
          where: { id: checkoutId },
        })
        if (previous) {
          if (previous.fingerprint !== fingerprint) {
            throw new ApiError(409, "Checkout identifier was reused")
          }
          return previous.result
        }

        const cabinet = await transaction.cabinet.findUnique({
          where: { id: cabinetId },
        })
        if (!cabinet || !cabinet.active || cabinet.isStaging) {
          throw new ApiError(404, "Cabinet checkout is unavailable")
        }

        if (selection.kind === "CONSUMABLE") {
          const item = await transaction.stockItem.findUnique({
            where: { id: selection.itemId },
          })
          if (!item || item.status !== StockItemStatus.CONSUMABLE) {
            throw new ApiError(404, "Consumable item not found")
          }
          const updated = await transaction.cabinetStock.updateMany({
            where: {
              cabinetId,
              itemId: selection.itemId,
              goodQuantity: { gte: quantity },
            },
            data: { goodQuantity: { decrement: quantity } },
          })
          if (!updated.count) {
            throw new ApiError(409, "Requested quantity is no longer available")
          }
          await transaction.stockMovement.create({
            data: {
              type: StockMovementType.ISSUE,
              itemId: selection.itemId,
              cabinetId,
              goodDelta: -quantity,
              responsiblePerson,
              borrowerDepartmentId,
              purpose,
              destinationLocation,
              actorName: responsiblePerson,
            },
          })
          const checkoutResult = {
            kind: selection.kind,
            item: item.name,
            quantity,
          }
          await transaction.checkoutRequest.create({
            data: { id: checkoutId, fingerprint, result: checkoutResult },
          })
          return checkoutResult
        }

        const assets = await transaction.asset.findMany({
          where: {
            cabinetId,
            category: selection.category,
            name: selection.name,
            condition: AssetCondition.GOOD,
            ownerDepartmentId: { not: borrowerDepartmentId },
            loans: { none: { returnedAt: null } },
          },
          orderBy: { assetTag: "asc" },
          take: quantity,
        })
        if (assets.length !== quantity) {
          throw new ApiError(409, "Requested quantity is no longer available")
        }

        const checkedOutAt = new Date()
        checkedOutAt.setUTCHours(0, 0, 0, 0)
        await transaction.loan.createMany({
          data: assets.map((asset) => ({
            id: randomUUID(),
            assetId: asset.id,
            borrowerDepartmentId,
            responsiblePerson,
            purpose,
            checkedOutAt,
            destinationLocation,
          })),
        })
        await transaction.activity.createMany({
          data: assets.map((asset) => ({
            id: randomUUID(),
            assetId: asset.id,
            type: ActivityType.BORROWED,
            actorName: responsiblePerson,
            summary: `${asset.assetTag} borrowed through ${cabinet.code}`,
            metadata: { cabinetId, destinationLocation, selfCheckout: true },
          })),
        })

        const checkoutResult = {
          kind: selection.kind,
          item: selection.name,
          quantity,
        }
        await transaction.checkoutRequest.create({
          data: { id: checkoutId, fingerprint, result: checkoutResult },
        })
        return checkoutResult
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )

    response.status(201).json(result)
  }
)
