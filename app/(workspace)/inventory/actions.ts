"use server"

import { revalidatePath } from "next/cache"

import type { ActionState } from "@/lib/action-state"
import { apiSend } from "@/lib/api"
import type { Cabinet } from "@/lib/asset-types"
import type { StockItem, StockItemStatus } from "@/lib/inventory-types"

function failed(error: unknown): ActionState {
  return {
    status: "error",
    message: error instanceof Error ? error.message : "Request failed",
  }
}

export async function createCabinet(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<Cabinet>("/inventory/cabinets", "POST", {
      code: formData.get("code"),
      name: formData.get("name"),
    })
  } catch (error) {
    return failed(error)
  }
  revalidatePath("/inventory")
  return { status: "success", message: "Cabinet created" }
}

export async function setCabinetActive(id: string, active: boolean) {
  await apiSend<Cabinet>(`/inventory/cabinets/${id}`, "PATCH", { active })
  revalidatePath("/inventory")
}

export async function updateCabinet(
  id: string,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<Cabinet>(`/inventory/cabinets/${id}`, "PATCH", {
      code: formData.get("code"),
      name: formData.get("name"),
    })
  } catch (error) {
    return failed(error)
  }
  revalidatePath("/inventory")
  return { status: "success", message: "Cabinet updated" }
}

export async function setStockStatus(id: string, status: StockItemStatus) {
  await apiSend<StockItem>(`/inventory/items/${id}/status`, "PATCH", {
    status,
  })
  revalidatePath("/inventory")
}

export async function transferStock(
  itemId: string,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<void>("/inventory/transfers", "POST", {
      itemId,
      fromCabinetId: formData.get("fromCabinetId"),
      toCabinetId: formData.get("toCabinetId"),
      goodQuantity: Number(formData.get("goodQuantity")),
      badQuantity: Number(formData.get("badQuantity")),
    })
  } catch (error) {
    return failed(error)
  }
  revalidatePath("/inventory")
  return { status: "success", message: "Stock transferred" }
}

export async function adjustStock(
  itemId: string,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<void>("/inventory/adjustments", "POST", {
      itemId,
      cabinetId: formData.get("cabinetId"),
      goodDelta: Number(formData.get("goodDelta")),
      badDelta: Number(formData.get("badDelta")),
      note: formData.get("note"),
    })
  } catch (error) {
    return failed(error)
  }
  revalidatePath("/inventory")
  return { status: "success", message: "Stock adjusted" }
}
