import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { ApiError, oneOf, REGISTERABLE_CATEGORIES } from "./input.js"

describe("asset registration categories", () => {
  it("accepts TLS, EQP, and ELK", () => {
    for (const category of ["TLS", "EQP", "ELK"]) {
      assert.equal(
        oneOf({ category }, "category", REGISTERABLE_CATEGORIES),
        category
      )
    }
  })

  it("rejects UNIT_SNI and unknown categories", () => {
    for (const category of ["UNIT_SNI", "BOGUS", ""]) {
      assert.throws(
        () => oneOf({ category }, "category", REGISTERABLE_CATEGORIES),
        ApiError,
        `expected ${category || "(empty)"} to be rejected`
      )
    }
  })
})
