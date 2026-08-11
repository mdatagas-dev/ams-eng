import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const apiUrl = process.env.API_URL ?? "http://localhost:4000/api"
export const SESSION_COOKIE = "ams_session"

async function requestHeaders(json = false) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return {
    ...(json ? { "content-type": "application/json" } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  }
}

export class ApiRequestError extends Error {
  constructor(public readonly status: number) {
    super(`Asset API request failed (${status})`)
  }
}

export async function apiGet<T>(
  path: string,
  options?: { throwOn401?: boolean }
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: await requestHeaders(),
  })

  if (response.status === 401 && !options?.throwOn401) {
    redirect("/login")
  }

  if (!response.ok) {
    throw new ApiRequestError(response.status)
  }

  return response.json() as Promise<T>
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH",
  body: unknown
) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: await requestHeaders(true),
    body: JSON.stringify(body),
  })
  if (response.status === 204) return undefined as T
  const data: unknown = await response.json()

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Request failed"
    throw new Error(message)
  }

  return data as T
}
