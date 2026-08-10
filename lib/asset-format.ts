import {
  getDictionary,
  type Language,
  type MessageKey,
} from "./i18n"
import type {
  ActivityType,
  AssetCategory,
  AssetCondition,
  Criticality,
} from "./asset-types"

export function conditionLabels(lang: Language) {
  const d = getDictionary(lang)
  return {
    GOOD: d.conditionGood,
    UNDER_REPAIR: d.conditionUnderRepair,
    DAMAGED: d.conditionDamaged,
  } as Record<AssetCondition, string>
}

export function categoryLabels(lang: Language) {
  const d = getDictionary(lang)
  return {
    TLS: d.categoryTls,
    EQP: d.categoryEqp,
    ELK: d.categoryElk,
    UNIT_SNI: d.categoryUnitSni,
  } as Record<AssetCategory, string>
}

export function criticalityLabels(lang: Language) {
  const d = getDictionary(lang)
  return {
    LOW: d.criticalityLow,
    MEDIUM: d.criticalityMedium,
    HIGH: d.criticalityHigh,
  } as Record<Criticality, string>
}

export function activityLabels(lang: Language) {
  const d = getDictionary(lang)
  return {
    REGISTERED: d.activityRegistered,
    UPDATED: d.activityUpdated,
    CONDITION_CHANGED: d.activityConditionChanged,
    BORROWED: d.activityBorrowed,
    RETURNED: d.activityReturned,
  } as Record<ActivityType, string>
}

const dateFormatters = {
  en: new Intl.DateTimeFormat("en-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }),
  id: new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }),
}

const dateTimeFormatters = {
  en: new Intl.DateTimeFormat("en-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }),
  id: new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }),
}

export function formatDate(value: string | Date | null, lang: Language) {
  return value
    ? dateFormatters[lang].format(new Date(value))
    : getDictionary(lang).notRecorded
}

export function formatDateTime(value: string | Date, lang: Language) {
  return dateTimeFormatters[lang].format(new Date(value))
}

export type { MessageKey }
