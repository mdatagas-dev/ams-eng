import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import {
  ActivityType,
  AssetCategory,
  AssetCondition,
  Criticality,
  PrismaClient,
  StockMovementType,
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

const assets = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    assetTag: "ENG/GAS/EQP/26-0001",
    name: "CNC Milling Machine 01",
    category: AssetCategory.EQP,
    manufacturer: "Mazak",
    model: "VCN-530C",
    serialNumber: "MZK-530-1842",
    ownerDepartmentId: departments[0][0],
    cabinetId: cabinets[0][0],
    location: "Machining Bay A",
    acquiredAt: new Date("2021-03-15"),
    criticality: Criticality.HIGH,
    condition: AssetCondition.GOOD,
    notes: "Primary precision machining unit.",
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    assetTag: "ENG/GAS/EQP/26-0002",
    name: "Rotary Screw Compressor 02",
    category: AssetCategory.EQP,
    manufacturer: "Atlas Copco",
    model: "GA 37+",
    serialNumber: "AC-GA37-9921",
    ownerDepartmentId: departments[0][0],
    cabinetId: cabinets[0][0],
    location: "Utility Room 1",
    acquiredAt: new Date("2019-08-20"),
    criticality: Criticality.HIGH,
    condition: AssetCondition.UNDER_REPAIR,
    notes: "Bearing inspection in progress.",
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    assetTag: "ENG/GAS/EQP/26-0003",
    name: "Electric Forklift 03",
    category: AssetCategory.EQP,
    manufacturer: "Toyota",
    model: "8FBE20",
    serialNumber: "TY-8FBE-3712",
    ownerDepartmentId: departments[0][0],
    cabinetId: cabinets[0][0],
    location: "Warehouse Dock",
    acquiredAt: new Date("2022-01-10"),
    criticality: Criticality.MEDIUM,
    condition: AssetCondition.GOOD,
    notes: null,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    assetTag: "ENG/GAS/EQP/26-0004",
    name: "Cooling Water Pump 04",
    category: AssetCategory.EQP,
    manufacturer: "Grundfos",
    model: "NB 80-200",
    serialNumber: "GF-NB80-4408",
    ownerDepartmentId: departments[0][0],
    cabinetId: cabinets[0][0],
    location: "Cooling Plant",
    acquiredAt: new Date("2018-06-04"),
    criticality: Criticality.HIGH,
    condition: AssetCondition.DAMAGED,
    notes: "Motor winding failure; replacement assessment required.",
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    assetTag: "ENG/GAS/TLS/26-0005",
    name: "Portable Vibration Analyzer",
    category: AssetCategory.TLS,
    manufacturer: "Fluke",
    model: "810",
    serialNumber: "FL-810-2098",
    ownerDepartmentId: departments[0][0],
    cabinetId: cabinets[0][0],
    location: "Engineering Tool Crib",
    acquiredAt: new Date("2023-04-18"),
    criticality: Criticality.MEDIUM,
    condition: AssetCondition.GOOD,
    notes: "Shared predictive-maintenance instrument.",
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    assetTag: "ENG/GAS/ELK/26-0006",
    name: "Engineering Workstation 21",
    category: AssetCategory.ELK,
    manufacturer: "Lenovo",
    model: "ThinkPad P1",
    serialNumber: "LN-P1-8821",
    ownerDepartmentId: departments[1][0],
    cabinetId: cabinets[1][0],
    location: "Engineering Office",
    acquiredAt: new Date("2024-02-12"),
    criticality: Criticality.MEDIUM,
    condition: AssetCondition.GOOD,
    notes: "CAD workstation assigned to the engineering pool.",
  },
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

  await prisma.$transaction(async (transaction) => {
    if ((await transaction.asset.count()) !== 0) return

    for (const asset of assets) {
      await transaction.asset.create({ data: asset })
      await transaction.activity.create({
        data: {
          id: asset.id.replace(/^2/, "4"),
          assetId: asset.id,
          type: ActivityType.REGISTERED,
          actorName: "System Seed",
          summary: `${asset.assetTag} registered`,
        },
      })
    }

    await transaction.assetCodeCounter.upsert({
      where: { year: 2026 },
      update: { nextNumber: assets.length + 1 },
      create: { year: 2026, nextNumber: assets.length + 1 },
    })

    await transaction.loan.create({
      data: {
        id: "30000000-0000-4000-8000-000000000001",
        assetId: assets[4].id,
        borrowerDepartmentId: departments[3][0],
        responsiblePerson: "Rina Pratama",
        purpose: "Production line vibration baseline inspection",
        destinationLocation: "Production line",
        checkedOutAt: new Date("2026-07-20"),
        notes: "Return with charger and magnetic mount.",
      },
    })

    await transaction.activity.create({
      data: {
        id: "40000000-0000-4000-8000-000000000101",
        assetId: assets[4].id,
        type: ActivityType.BORROWED,
        actorName: "System Seed",
        summary: `${assets[4].assetTag} borrowed by QA/QC`,
        metadata: { loanId: "30000000-0000-4000-8000-000000000001" },
      },
    })
  })

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
