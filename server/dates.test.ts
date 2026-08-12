import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { jakartaDay, jakartaYear } from "./dates.js"

describe("Jakarta calendar day", () => {
  it("maps a 06:30 WIB moment to the Jakarta date, not the UTC date", () => {
    // 2026-03-10 06:30 WIB == 2026-03-09 23:30 UTC
    const moment = new Date("2026-03-09T23:30:00.000Z")
    assert.equal(jakartaDay(moment).toISOString(), "2026-03-10T00:00:00.000Z")
  })

  it("keeps daytime hours on the same date", () => {
    // 2026-03-10 14:00 WIB == 07:00 UTC
    const moment = new Date("2026-03-10T07:00:00.000Z")
    assert.equal(jakartaDay(moment).toISOString(), "2026-03-10T00:00:00.000Z")
  })

  it("resolves the year from the Jakarta calendar, not UTC", () => {
    // 2027-01-01 06:00 WIB == 2026-12-31 23:00 UTC
    const moment = new Date("2026-12-31T23:00:00.000Z")
    assert.equal(jakartaYear(moment), 2027)
  })

  it("keeps a normal daytime year unchanged", () => {
    const moment = new Date("2026-07-10T03:00:00.000Z")
    assert.equal(jakartaYear(moment), 2026)
  })
})
