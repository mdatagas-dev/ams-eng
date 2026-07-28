import type {
  ActivityType,
  AssetCategory,
  AssetCondition,
  Criticality,
} from "./asset-types"

export const conditionLabels: Record<AssetCondition, string> = {
  GOOD: "Baik",
  UNDER_REPAIR: "Dalam Perbaikan",
  DAMAGED: "Rusak",
}

export const categoryLabels: Record<AssetCategory, string> = {
  TLS: "Tools",
  EQP: "Equipment",
  ELK: "Electronics",
}

export const criticalityLabels: Record<Criticality, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
}

export const activityLabels: Record<ActivityType, string> = {
  REGISTERED: "Registered",
  UPDATED: "Updated",
  CONDITION_CHANGED: "Condition changed",
  BORROWED: "Borrowed",
  RETURNED: "Returned",
}

const dateFormatter = new Intl.DateTimeFormat("en-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
})

export function formatDate(value: string | Date | null) {
  return value ? dateFormatter.format(new Date(value)) : "Not recorded"
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value))
}
