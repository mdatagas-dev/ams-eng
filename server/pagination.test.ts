import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { ApiError, queryInt } from "./input.js"

describe("queryInt pagination helper", () => {
  it("parses valid pagination values", () => {
    assert.equal(queryInt("10", "limit", 1, 200), 10)
    assert.equal(queryInt("0", "offset", 0, 100_000), 0)
    assert.equal(queryInt(undefined, "limit", 1, 200), undefined)
  })

  it("rejects out-of-range and non-integers", () => {
    assert.throws(() => queryInt("0", "limit", 1, 200), ApiError)
    assert.throws(() => queryInt("201", "limit", 1, 200), ApiError)
    assert.throws(() => queryInt("1.5", "limit", 1, 200), ApiError)
    assert.throws(() => queryInt("abc", "limit", 1, 200), ApiError)
    assert.throws(() => queryInt("-1", "offset", 0, 100_000), ApiError)
  })
})
