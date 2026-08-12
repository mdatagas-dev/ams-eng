export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
  }
}

export type Input = Record<string, unknown>

export function input(value: unknown): Input {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "Request body must be a JSON object")
  }

  return value as Input
}

export function has(value: Input, key: string) {
  return Object.hasOwn(value, key)
}

export function text(value: Input, key: string, maxLength: number) {
  const field = value[key]

  if (typeof field !== "string" || !field.trim()) {
    throw new ApiError(400, `${key} is required`)
  }

  const result = field.trim()
  if (result.length > maxLength) {
    throw new ApiError(400, `${key} must be ${maxLength} characters or fewer`)
  }

  return result
}

export function secret(value: Input, key: string, maxLength: number) {
  const field = value[key]
  if (typeof field !== "string" || !field) {
    throw new ApiError(400, `${key} is required`)
  }
  if (field.length > maxLength) {
    throw new ApiError(400, `${key} must be ${maxLength} characters or fewer`)
  }

  return field
}

export function username(value: Input, key = "username") {
  const result = text(value, key, 32).toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(result)) {
    throw new ApiError(
      400,
      `${key} must be 3-32 characters using letters, numbers, dot, underscore, or hyphen`
    )
  }
  return result
}

export function nullableText(value: Input, key: string, maxLength: number) {
  const field = value[key]

  if (field === undefined) return undefined
  if (field === null || field === "") return null
  if (typeof field !== "string") {
    throw new ApiError(400, `${key} must be text`)
  }

  const result = field.trim()
  if (result.length > maxLength) {
    throw new ApiError(400, `${key} must be ${maxLength} characters or fewer`)
  }

  return result || null
}

export function oneOf<T extends string>(
  value: Input,
  key: string,
  choices: readonly T[]
) {
  const field = value[key]
  if (typeof field !== "string" || !choices.includes(field as T)) {
    throw new ApiError(400, `${key} must be one of: ${choices.join(", ")}`)
  }

  return field as T
}

export function integer(
  value: Input,
  key: string,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER
) {
  const field = value[key]
  if (
    !Number.isSafeInteger(field) ||
    (field as number) < min ||
    (field as number) > max
  ) {
    throw new ApiError(
      400,
      `${key} must be an integer between ${min} and ${max}`
    )
  }
  return field as number
}

export function date(value: Input, key: string) {
  const field = value[key]
  if (typeof field !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(field)) {
    throw new ApiError(400, `${key} must be a valid YYYY-MM-DD date`)
  }

  const result = new Date(`${field}T00:00:00.000Z`)
  if (
    Number.isNaN(result.getTime()) ||
    result.toISOString().slice(0, 10) !== field
  ) {
    throw new ApiError(400, `${key} must be a valid YYYY-MM-DD date`)
  }

  return result
}

export function nullableDate(value: Input, key: string) {
  if (!has(value, key)) return undefined
  if (value[key] === null || value[key] === "") return null
  return date(value, key)
}

export function timestamp(value: Input, key: string) {
  const field = value[key]
  if (typeof field !== "string") {
    throw new ApiError(400, `${key} must be a valid timestamp`)
  }

  const result = new Date(field)
  if (Number.isNaN(result.getTime())) {
    throw new ApiError(400, `${key} must be a valid timestamp`)
  }

  return result
}

export function uuid(value: unknown, name = "id") {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  ) {
    throw new ApiError(400, `${name} must be a valid UUID`)
  }

  return value
}

export function queryText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}
