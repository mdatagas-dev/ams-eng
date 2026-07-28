"use server"

import { revalidatePath } from "next/cache"

import type { ActionState } from "@/lib/action-state"
import { apiSend } from "@/lib/api"

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
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Checkout failed",
    }
  }

  revalidatePath("/")
  revalidatePath("/assets")
  revalidatePath("/borrowings")
  revalidatePath("/history")
  revalidatePath("/inventory")
  revalidatePath(`/checkout/cabinet/${cabinetId}`)

  return {
    status: "success",
    message: `${result.quantity} x ${result.item} checked out successfully.`,
  }
}
