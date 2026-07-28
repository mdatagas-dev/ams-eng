import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  validatePassword,
  verifyPassword,
} from "./password.js"

describe("authentication secrets", () => {
  it("hashes passwords and rejects the wrong password", async () => {
    const stored = await hashPassword("Correct-Horse-2026")

    assert.equal(await verifyPassword("Correct-Horse-2026", stored), true)
    assert.equal(await verifyPassword("Wrong-Battery-2026", stored), false)
    assert.equal(await verifyPassword("anything", "scrypt$foo$!"), false)
    assert.equal(stored.includes("Correct-Horse-2026"), false)
  })

  it("creates opaque session tokens and deterministic hashes", () => {
    const token = createSessionToken()

    assert.equal(token.length >= 40, true)
    assert.equal(hashSessionToken(token), hashSessionToken(token))
    assert.notEqual(hashSessionToken(token), token)
  })

  it("requires passwords to contain at least 8 characters", () => {
    assert.doesNotThrow(() => validatePassword("12345678"))
    assert.throws(() => validatePassword("1234567"), /8 and 128/)
  })
})
