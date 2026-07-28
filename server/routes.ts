import { Router, type Request } from "express"

import {
  ActivityType,
  AssetCategory,
  AssetCondition,
  Criticality,
  Prisma,
  UserRole,
} from "./generated/prisma/client.js"
import { authRoutes, userRoutes } from "./auth-routes.js"
import { requireAuth, requireRole } from "./auth.js"
import { prisma } from "./db.js"
import { inventoryRoutes, publicInventoryRoutes } from "./inventory-routes.js"
import {
  ApiError,
  date,
  has,
  input,
  nullableDate,
  nullableText,
  oneOf,
  queryText,
  text,
  timestamp,
  uuid,
  type Input,
} from "./input.js"

export const api = Router()

const categories = Object.values(AssetCategory)
const conditions = Object.values(AssetCondition)
const criticalities = Object.values(Criticality)

const assetInclude = {
  ownerDepartment: true,
  cabinet: true,
  loans: {
    where: { returnedAt: null },
    include: { borrowerDepartment: true },
    orderBy: { checkedOutAt: "desc" as const },
    take: 1,
  },
}

function actorName(request: Request) {
  if (!request.auth) throw new ApiError(401, "Authentication required")
  return request.auth.name
}

function createAssetData(
  body: Input
): Omit<Prisma.AssetUncheckedCreateInput, "assetTag"> {
  return {
    name: text(body, "name", 150),
    category: oneOf(body, "category", categories),
    manufacturer: nullableText(body, "manufacturer", 100),
    model: nullableText(body, "model", 100),
    serialNumber: nullableText(body, "serialNumber", 100),
    ownerDepartmentId: uuid(body.ownerDepartmentId, "ownerDepartmentId"),
    cabinetId: body.cabinetId ? uuid(body.cabinetId, "cabinetId") : null,
    location: text(body, "location", 150),
    acquiredAt: nullableDate(body, "acquiredAt"),
    criticality: oneOf(body, "criticality", criticalities),
    condition: oneOf(body, "condition", conditions),
    notes: nullableText(body, "notes", 5000),
  }
}

function updateAssetData(body: Input): Prisma.AssetUncheckedUpdateInput {
  const data: Prisma.AssetUncheckedUpdateInput = {}

  if (has(body, "name")) data.name = text(body, "name", 150)
  if (has(body, "manufacturer"))
    data.manufacturer = nullableText(body, "manufacturer", 100)
  if (has(body, "model")) data.model = nullableText(body, "model", 100)
  if (has(body, "serialNumber"))
    data.serialNumber = nullableText(body, "serialNumber", 100)
  if (has(body, "ownerDepartmentId")) {
    data.ownerDepartmentId = uuid(body.ownerDepartmentId, "ownerDepartmentId")
  }
  if (has(body, "cabinetId")) {
    data.cabinetId = body.cabinetId ? uuid(body.cabinetId, "cabinetId") : null
  }
  if (has(body, "location")) data.location = text(body, "location", 150)
  if (has(body, "acquiredAt"))
    data.acquiredAt = nullableDate(body, "acquiredAt")
  if (has(body, "criticality"))
    data.criticality = oneOf(body, "criticality", criticalities)
  if (has(body, "notes")) data.notes = nullableText(body, "notes", 5000)

  if (!Object.keys(data).length) {
    throw new ApiError(400, "At least one asset field must be provided")
  }

  return data
}

api.use("/auth", authRoutes)
api.use("/public", publicInventoryRoutes)
api.use(requireAuth)
api.use("/users", requireRole(UserRole.SUPER_USER), userRoutes)
api.use("/inventory", inventoryRoutes)

api.get("/departments", async (_request, response) => {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  })
  response.json(departments)
})

api.get("/assets", async (request, response) => {
  const search = queryText(request.query.search)
  const condition = queryText(request.query.condition)
  const category = queryText(request.query.category)
  const departmentId = queryText(request.query.departmentId)
  const custody = queryText(request.query.custody)

  const where: Prisma.AssetWhereInput = {
    ...(search
      ? {
          OR: ["assetTag", "name", "manufacturer", "model", "serialNumber"].map(
            (field) => ({
              [field]: { contains: search, mode: "insensitive" as const },
            })
          ),
        }
      : {}),
    ...(condition && conditions.includes(condition as AssetCondition)
      ? { condition: condition as AssetCondition }
      : {}),
    ...(category && categories.includes(category as AssetCategory)
      ? { category: category as AssetCategory }
      : {}),
    ...(departmentId
      ? { ownerDepartmentId: uuid(departmentId, "departmentId") }
      : {}),
    ...(custody === "borrowed"
      ? { loans: { some: { returnedAt: null } } }
      : {}),
    ...(custody === "available"
      ? { loans: { none: { returnedAt: null } } }
      : {}),
  }

  const assets = await prisma.asset.findMany({
    where,
    include: assetInclude,
    orderBy: [{ condition: "asc" }, { assetTag: "asc" }],
  })

  response.json(assets)
})

api.get("/assets/:id", async (request, response) => {
  const id = uuid(request.params.id)
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      ownerDepartment: true,
      cabinet: true,
      loans: {
        include: { borrowerDepartment: true },
        orderBy: { checkedOutAt: "desc" },
      },
      activities: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!asset) throw new ApiError(404, "Asset not found")
  response.json(asset)
})

api.post("/assets", async (request, response) => {
  const body = input(request.body)
  const data = createAssetData(body)

  const asset = await prisma.$transaction(async (transaction) => {
    const now = new Date()
    const year = now.getUTCFullYear()
    const counter = await transaction.assetCodeCounter.upsert({
      where: { year },
      update: { nextNumber: { increment: 1 } },
      create: { year, nextNumber: 2 },
    })
    const sequence = counter.nextNumber - 1
    const assetTag = `ENG/GAS/${data.category}/${String(year % 100).padStart(2, "0")}-${String(sequence).padStart(4, "0")}`
    const created = await transaction.asset.create({
      data: { ...data, assetTag },
    })
    await transaction.activity.create({
      data: {
        assetId: created.id,
        type: ActivityType.REGISTERED,
        actorName: actorName(request),
        summary: `${created.assetTag} registered`,
      },
    })

    return transaction.asset.findUniqueOrThrow({
      where: { id: created.id },
      include: assetInclude,
    })
  })

  response.status(201).json(asset)
})

api.patch("/assets/:id", async (request, response) => {
  const id = uuid(request.params.id)
  const body = input(request.body)
  const data = updateAssetData(body)
  const expectedUpdatedAt = timestamp(body, "updatedAt")

  const asset = await prisma.$transaction(
    async (transaction) => {
      const existing = await transaction.asset.findUnique({ where: { id } })
      if (!existing) throw new ApiError(404, "Asset not found")
      if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
        throw new ApiError(
          409,
          "Asset changed since it was opened; reload and try again"
        )
      }

      const newOwnerId = has(body, "ownerDepartmentId")
        ? uuid(body.ownerDepartmentId, "ownerDepartmentId")
        : undefined
      if (newOwnerId && newOwnerId !== existing.ownerDepartmentId) {
        const activeLoan = await transaction.loan.findFirst({
          where: { assetId: id, returnedAt: null },
        })
        if (activeLoan?.borrowerDepartmentId === newOwnerId) {
          throw new ApiError(
            409,
            "Return the asset before assigning ownership to its borrower"
          )
        }
      }

      const current = existing as unknown as Record<string, unknown>
      const comparable = (value: unknown) =>
        value instanceof Date ? value.getTime() : value
      const changedFields = Object.entries(data)
        .filter(
          ([field, value]) => comparable(current[field]) !== comparable(value)
        )
        .map(([field]) => field)

      if (!changedFields.length) {
        throw new ApiError(400, "No asset changes detected")
      }

      const updated = await transaction.asset.update({ where: { id }, data })
      await transaction.activity.create({
        data: {
          assetId: id,
          type: ActivityType.UPDATED,
          actorName: actorName(request),
          summary: `${updated.assetTag} details updated`,
          metadata: { changedFields },
        },
      })

      return transaction.asset.findUniqueOrThrow({
        where: { id },
        include: assetInclude,
      })
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )

  response.json(asset)
})

api.post("/assets/:id/condition", async (request, response) => {
  const id = uuid(request.params.id)
  const body = input(request.body)
  const condition = oneOf(body, "condition", conditions)
  const note = nullableText(body, "note", 500)

  const asset = await prisma.$transaction(
    async (transaction) => {
      const existing = await transaction.asset.findUnique({ where: { id } })
      if (!existing) throw new ApiError(404, "Asset not found")
      if (existing.condition === condition) {
        throw new ApiError(409, `Asset condition is already ${condition}`)
      }

      const updated = await transaction.asset.update({
        where: { id },
        data: { condition },
      })
      await transaction.activity.create({
        data: {
          assetId: id,
          type: ActivityType.CONDITION_CHANGED,
          actorName: actorName(request),
          summary: `${updated.assetTag} condition changed from ${existing.condition} to ${condition}`,
          metadata: { from: existing.condition, to: condition, note },
        },
      })

      return transaction.asset.findUniqueOrThrow({
        where: { id },
        include: assetInclude,
      })
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )

  response.json(asset)
})

api.post("/assets/:id/loans", async (request, response) => {
  const assetId = uuid(request.params.id)
  const body = input(request.body)
  const checkedOutAt = date(body, "checkedOutAt")
  const destinationLocation = text(body, "destinationLocation", 150)
  const borrowerDepartmentId = uuid(
    body.borrowerDepartmentId,
    "borrowerDepartmentId"
  )

  const loan = await prisma.$transaction(
    async (transaction) => {
      const asset = await transaction.asset.findUnique({
        where: { id: assetId },
      })
      if (!asset) throw new ApiError(404, "Asset not found")
      if (asset.condition !== AssetCondition.GOOD) {
        throw new ApiError(409, "Only assets in good condition can be borrowed")
      }
      if (asset.ownerDepartmentId === borrowerDepartmentId) {
        throw new ApiError(
          400,
          "Borrowing department must differ from the asset owner"
        )
      }

      const activeLoan = await transaction.loan.findFirst({
        where: { assetId, returnedAt: null },
      })
      if (activeLoan) throw new ApiError(409, "Asset is already borrowed")

      const created = await transaction.loan.create({
        data: {
          assetId,
          borrowerDepartmentId,
          responsiblePerson: text(body, "responsiblePerson", 150),
          purpose: text(body, "purpose", 250),
          checkedOutAt,
          destinationLocation,
          notes: nullableText(body, "notes", 5000),
        },
        include: { asset: true, borrowerDepartment: true },
      })

      await transaction.activity.create({
        data: {
          assetId,
          type: ActivityType.BORROWED,
          actorName: actorName(request),
          summary: `${asset.assetTag} borrowed by ${created.borrowerDepartment.name}`,
          metadata: {
            loanId: created.id,
            destinationLocation,
          },
        },
      })

      return created
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )

  response.status(201).json(loan)
})

api.post("/loans/:id/return", async (request, response) => {
  const id = uuid(request.params.id)
  const body = input(request.body)
  const returnedAt = date(body, "returnedAt")

  const loan = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.loan.findUnique({
      where: { id },
      include: { asset: true },
    })
    if (!existing) throw new ApiError(404, "Loan not found")
    if (existing.returnedAt)
      throw new ApiError(409, "Asset has already been returned")
    if (returnedAt < existing.checkedOutAt) {
      throw new ApiError(400, "returnedAt cannot be before checkedOutAt")
    }

    const result = await transaction.loan.updateMany({
      where: { id, returnedAt: null },
      data: {
        returnedAt,
        returnNotes: nullableText(body, "notes", 5000),
      },
    })
    if (!result.count) {
      throw new ApiError(409, "Asset has already been returned")
    }

    const updated = await transaction.loan.findUniqueOrThrow({
      where: { id },
      include: { asset: true, borrowerDepartment: true },
    })

    await transaction.activity.create({
      data: {
        assetId: existing.assetId,
        type: ActivityType.RETURNED,
        actorName: actorName(request),
        summary: `${existing.asset.assetTag} returned`,
        metadata: {
          loanId: id,
          returnedAt: returnedAt.toISOString().slice(0, 10),
        },
      },
    })

    return updated
  })

  response.json(loan)
})

api.get("/loans", async (request, response) => {
  const status = queryText(request.query.status)
  const loans = await prisma.loan.findMany({
    where:
      status === "active"
        ? { returnedAt: null }
        : status === "returned"
          ? { returnedAt: { not: null } }
          : {},
    include: { asset: true, borrowerDepartment: true },
    orderBy: [{ returnedAt: "asc" }, { checkedOutAt: "desc" }],
  })
  response.json(loans)
})

api.get("/activities", async (_request, response) => {
  const activities = await prisma.activity.findMany({
    include: { asset: { select: { id: true, assetTag: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  response.json(activities)
})

api.get("/dashboard", async (_request, response) => {
  const [total, byCondition, activeLoans, activeLoanDetails, recentActivity] =
    await Promise.all([
      prisma.asset.count(),
      prisma.asset.groupBy({ by: ["condition"], _count: true }),
      prisma.loan.count({ where: { returnedAt: null } }),
      prisma.loan.findMany({
        where: { returnedAt: null },
        include: { asset: true, borrowerDepartment: true },
        orderBy: { checkedOutAt: "desc" },
        take: 5,
      }),
      prisma.activity.findMany({
        include: {
          asset: { select: { id: true, assetTag: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ])

  response.json({
    total,
    byCondition,
    activeLoans,
    activeLoanDetails,
    recentActivity,
  })
})
