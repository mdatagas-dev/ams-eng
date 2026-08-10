"use server"

import { revalidatePath } from "next/cache"

import { apiSend } from "@/lib/api"
import type { ActionState } from "@/lib/action-state"
import type { ManagedUser } from "@/lib/auth-types"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

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
    const t = getDictionary(await getLang())
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : t.unableToCreateUser,
    }
  }

  revalidatePath("/users")
  return { status: "success", message: (await getDictionary(await getLang())).userCreated }
}

export async function setUserActive(id: string, active: boolean) {
  await apiSend<ManagedUser>(`/users/${id}/active`, "PATCH", { active })
  revalidatePath("/users")
}
