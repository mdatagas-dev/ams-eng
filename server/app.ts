import express from "express"

import { ApiError } from "./input.js"
import { api } from "./routes.js"

export const app = express()

app.disable("x-powered-by")
app.use(express.json())

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" })
})

app.use("/api", api)

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "Not found" })
})

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    void next

    if (error instanceof ApiError) {
      response.status(error.status).json({ error: error.message })
      return
    }

    if (
      error instanceof SyntaxError &&
      "status" in error &&
      error.status === 400
    ) {
      response
        .status(400)
        .json({ error: "Request body must contain valid JSON" })
      return
    }

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 413
    ) {
      response.status(413).json({ error: "Request body is too large" })
      return
    }

    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : undefined

    if (code === "P2002" || code === "23505") {
      response
        .status(409)
        .json({ error: "A record with that unique value already exists" })
      return
    }

    if (code === "P2003" || code === "23503") {
      response.status(400).json({ error: "A referenced record does not exist" })
      return
    }

    if (code === "P2034") {
      response
        .status(409)
        .json({ error: "Concurrent update detected; try again" })
      return
    }

    if (code === "P2025") {
      response.status(404).json({ error: "Record not found" })
      return
    }

    console.error(error)
    response.status(500).json({ error: "Internal server error" })
  }
)
