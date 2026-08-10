"use server"

import { revalidatePath } from "next/cache"

import type { ActionState } from "@/lib/action-state"
import { apiSend } from "@/lib/api"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

type CheckoutResult = {
  kind: "CONSUMABLE" | "DURABLE"
  item: string
  quantity: number
}

export async function checkoutFromCabinet(
  cabinetId: string,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  let result: CheckoutResult
  try {
    result = await apiSend<CheckoutResult>(
      `/public/cabinets/${cabinetId}/checkout`,
      "POST",
      {
        kind: formData.get("kind"),
        checkoutId: formData.get("checkoutId"),
        itemId: formData.get("itemId"),
        category: formData.get("category"),
        name: formData.get("itemName"),
        quantity: Number(formData.get("quantity")),
        responsiblePerson: formData.get("responsiblePerson"),
        borrowerDepartmentId: formData.get("borrowerDepartmentId"),
        purpose: formData.get("purpose"),
        destinationLocation: formData.get("destinationLocation"),
      }
    )
  } catch (error) {
    const t = getDictionary(await getLang())
    return {
      status: "error",
      message: error instanceof Error ? error.message : t.checkoutFailed,
    }
  }

  revalidatePath("/")
  revalidatePath("/assets")
  revalidatePath("/borrowings")
  revalidatePath("/history")
  revalidatePath(`/checkout/cabinet/${cabinetId}`)

  const t = getDictionary(await getLang())
  return {
    status: "success",
    message: t.checkoutSuccess
      .replace("{quantity}", String(result.quantity))
      .replace("{item}", result.item),
  }
}
