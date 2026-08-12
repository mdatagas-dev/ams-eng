const jakartaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function jakartaParts(value: Date) {
  const parts = jakartaDateFormatter.formatToParts(value)
  const get = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value
  return { year: get("year"), month: get("month"), day: get("day") }
}

/**
 * The calendar date of `value` in Asia/Jakarta, returned as a UTC-midnight
 * Date. Matches how YYYY-MM-DD strings are parsed, stored, and displayed
 * everywhere else in this app (see date() in input.ts and the UTC formatters
 * in lib/asset-format.ts).
 */
export function jakartaDay(value: Date): Date {
  const { year, month, day } = jakartaParts(value)
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`)
}

/** Year of the Jakarta calendar date of `value`. */
export function jakartaYear(value: Date): number {
  return Number(jakartaParts(value).year)
}
