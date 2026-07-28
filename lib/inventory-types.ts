import type { AssetCategory, Cabinet, Department } from "./asset-types"

export type StockItemStatus = "UNCLASSIFIED" | "CONSUMABLE"
export type StockMovementType = "IMPORT" | "ISSUE" | "TRANSFER" | "ADJUSTMENT"

export type CabinetStock = {
  cabinetId: string
  itemId: string
  goodQuantity: number
  badQuantity: number
  cabinet: Pick<Cabinet, "id" | "code" | "name">
}

export type StockItem = {
  id: string
  sourceKey: string
  sourceRow: number
  sourceStock: number
  name: string
  supplier: string | null
  specification: string | null
  status: StockItemStatus
  stocks: CabinetStock[]
}

export type StockMovement = {
  id: string
  type: StockMovementType
  goodDelta: number
  badDelta: number
  actorName: string
  createdAt: string
  item: { name: string }
  cabinet: Pick<Cabinet, "code" | "name">
  borrowerDepartment: Pick<Department, "name"> | null
}

export type InventoryData = {
  cabinets: Array<Cabinet & { _count: { assets: number } }>
  items: StockItem[]
  movements: StockMovement[]
}

export type CheckoutItem =
  | {
      kind: "CONSUMABLE"
      itemId: string
      sourceRow: number
      name: string
      specification: string | null
      available: number
    }
  | {
      kind: "DURABLE"
      category: AssetCategory
      name: string
      specification: null
      available: number
      availableByDepartment: Record<string, number>
    }

export type CabinetCheckoutData = {
  cabinet: Pick<Cabinet, "id" | "code" | "name">
  departments: Department[]
  items: CheckoutItem[]
}
