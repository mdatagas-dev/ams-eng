export type AssetCondition = "GOOD" | "UNDER_REPAIR" | "DAMAGED"
export type AssetCategory = "TLS" | "EQP" | "ELK" | "UNIT_SNI"
export type ActivityType =
  "REGISTERED" | "UPDATED" | "CONDITION_CHANGED" | "BORROWED" | "RETURNED"

export type Department = {
  id: string
  code: string
  name: string
}

export type Cabinet = {
  id: string
  code: string
  name: string
  active: boolean
  isStaging: boolean
}

export type Activity = {
  id: string
  assetId: string
  type: ActivityType
  actorName: string
  summary: string
  metadata: Record<string, unknown> | null
  createdAt: string
  asset?: Pick<Asset, "id" | "assetTag" | "name">
}

export type Loan = {
  id: string
  assetId: string
  borrowerDepartmentId: string
  responsiblePerson: string
  purpose: string
  checkedOutAt: string
  returnedAt: string | null
  destinationLocation: string | null
  notes: string | null
  returnNotes: string | null
  borrowerDepartment: Department
  asset?: Pick<Asset, "id" | "assetTag" | "name">
}

export type Asset = {
  id: string
  assetTag: string
  name: string
  category: AssetCategory
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  ownerDepartmentId: string
  cabinetId: string | null
  location: string
  acquiredAt: string | null
  condition: AssetCondition
  createdAt: string
  updatedAt: string
  ownerDepartment: Department
  cabinet: Cabinet | null
  loans: Loan[]
  activities?: Activity[]
}

export type DashboardData = {
  total: number
  byCondition: Array<{ condition: AssetCondition; _count: number }>
  activeLoans: number
  activeLoanDetails: Loan[]
  recentActivity: Activity[]
}
