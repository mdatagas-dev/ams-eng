import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  ApiError,
  date,
  input,
  integer,
  oneOf,
  text,
  timestamp,
  username,
  uuid,
} from "./input.js"

describe("API input validation", () => {
  it("normalizes valid text and dates", () => {
    const body = input({ name: "  Cooling Pump  ", condition: "GOOD" })

    assert.equal(text(body, "name", 50), "Cooling Pump")
    assert.equal(oneOf(body, "condition", ["GOOD", "DAMAGED"]), "GOOD")
    assert.equal(integer({ quantity: 3 }, "quantity", 1, 10), 3)
    assert.equal(username({ username: "QA.Admin" }), "qa.admin")
    assert.equal(
      date({ dueAt: "2026-07-25" }, "dueAt").toISOString(),
      "2026-07-25T00:00:00.000Z"
    )
    assert.equal(
      timestamp(
        { updatedAt: "2026-07-23T12:00:00.000Z" },
        "updatedAt"
      ).toISOString(),
      "2026-07-23T12:00:00.000Z"
    )
  })

  it("rejects invalid trust-boundary values", () => {
    assert.throws(() => text({ name: "" }, "name", 50), ApiError)
    assert.throws(() => date({ dueAt: "2026-02-30" }, "dueAt"), ApiError)
    assert.throws(
      () => timestamp({ updatedAt: "yesterday" }, "updatedAt"),
      ApiError
    )
    assert.throws(() => username({ username: "not valid" }), ApiError)
    assert.throws(() => integer({ quantity: 0 }, "quantity", 1, 10), ApiError)
    assert.throws(() => uuid("not-an-id"), ApiError)
  })
})
