"use server"

import { revalidatePath } from "next/cache"

import { apiSend } from "@/lib/api"
import type { ActionState } from "@/lib/action-state"
import type { ManagedUser } from "@/lib/auth-types"

export async function createUser(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<ManagedUser>("/users", "POST", {
      name: formData.get("name"),
      username: formData.get("username"),
      password: formData.get("password"),
      role: formData.get("role"),
    })
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create user",
    }
  }

  revalidatePath("/users")
  return { status: "success", message: "User account created" }
}

export async function setUserActive(id: string, active: boolean) {
  await apiSend<ManagedUser>(`/users/${id}/active`, "PATCH", { active })
  revalidatePath("/users")
}
