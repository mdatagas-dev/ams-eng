import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

export function validatePassword(password: string) {
  if (password.length < 8 || password.length > 128) {
    throw new Error("Password must be between 8 and 128 characters")
  }
}

export async function hashPassword(password: string) {
  validatePassword(password)
  const salt = randomBytes(16)
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, saltValue, hashValue] = stored.split("$")
  if (algorithm !== "scrypt" || !saltValue || !hashValue) return false

  const salt = Buffer.from(saltValue, "base64url")
  const expected = Buffer.from(hashValue, "base64url")
  if (salt.length !== 16 || expected.length !== 64) return false
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url")
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}
