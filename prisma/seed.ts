import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import {
  StockMovementType,
  PrismaClient,
  UserRole,
} from "../server/generated/prisma/client.js"
import { hashPassword } from "../server/password.js"
import { julyStock } from "./data/stock-july-2026.js"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required")
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

const departments = [
  ["10000000-0000-4000-8000-000000000001", "ENG", "Engineering"],
  ["10000000-0000-4000-8000-000000000002", "IT", "Information Technology"],
  ["10000000-0000-4000-8000-000000000003", "PRD", "Production"],
  ["10000000-0000-4000-8000-000000000004", "QA", "QA/QC"],
  ["10000000-0000-4000-8000-000000000005", "HSE", "HSE"],
  ["10000000-0000-4000-8000-000000000006", "WH", "Warehouse"],
] as const

const cabinets = [
  ["50000000-0000-4000-8000-000000000001", "A", "Cabinet A", false],
  ["50000000-0000-4000-8000-000000000002", "B", "Cabinet B", false],
  ["50000000-0000-4000-8000-000000000003", "C", "Cabinet C", false],
  ["50000000-0000-4000-8000-000000000004", "D", "Cabinet D", false],
  [
    "50000000-0000-4000-8000-000000000099",
    "UNASSIGNED",
    "Unassigned imported stock",
    true,
  ],
] as const

async function main() {
  const bootstrapUsers = [
    {
      name: process.env.BOOTSTRAP_SUPERUSER_NAME,
      username: process.env.BOOTSTRAP_SUPERUSER_USERNAME,
      password: process.env.BOOTSTRAP_SUPERUSER_PASSWORD,
      role: UserRole.SUPER_USER,
    },
    {
      name: process.env.BOOTSTRAP_ADMIN_NAME,
      username: process.env.BOOTSTRAP_ADMIN_USERNAME,
      password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
      role: UserRole.ADMIN,
    },
  ]

  for (const user of bootstrapUsers) {
    if (!user.name || !user.username || !user.password) continue
    const username = user.username.trim().toLowerCase()
    const passwordHash = await hashPassword(user.password)
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        name: user.name.trim(),
        username,
        passwordHash,
        role: user.role,
      },
    })
  }

  for (const [id, code, name] of departments) {
    await prisma.department.upsert({
      where: { id },
      update: { code, name },
      create: { id, code, name },
    })
  }

  for (const [id, code, name, isStaging] of cabinets) {
    await prisma.cabinet.upsert({
      where: { id },
      update: {},
      create: { id, code, name, isStaging },
    })
  }

  const stagingCabinetId = cabinets[4][0]
  for (const row of julyStock) {
    const sourceKey = `stock-2026-07:JULI-2026:R${String(row.row).padStart(3, "0")}`
    const item = await prisma.stockItem.upsert({
      where: { sourceKey },
      update: {
        sourceRow: row.row,
        sourceStock: row.stock,
        name: row.name,
        supplier: row.supplier,
        specification: row.specification,
      },
      create: {
        sourceKey,
        sourceRow: row.row,
        sourceStock: row.stock,
        name: row.name,
        supplier: row.supplier,
        specification: row.specification,
      },
    })

    await prisma.cabinetStock.upsert({
      where: {
        cabinetId_itemId: { cabinetId: stagingCabinetId, itemId: item.id },
      },
      update: {},
      create: {
        cabinetId: stagingCabinetId,
        itemId: item.id,
        goodQuantity: row.good,
        badQuantity: row.bad,
      },
    })

    await prisma.stockMovement.upsert({
      where: { sourceKey },
      update: {},
      create: {
        type: StockMovementType.IMPORT,
        itemId: item.id,
        cabinetId: stagingCabinetId,
        goodDelta: row.good,
        badDelta: row.bad,
        actorName: "System Import",
        sourceKey,
        metadata: {
          sheet: "JULI 2026",
          row: row.row,
          serial: row.serial,
          sourceStock: row.stock,
        },
      },
    })
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
