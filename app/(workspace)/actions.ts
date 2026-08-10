"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { apiSend } from "@/lib/api"
import type { ActionState } from "@/lib/action-state"
import type { Asset, Loan } from "@/lib/asset-types"
import { getDictionary, type MessageKey } from "@/lib/i18n"
import { getLang } from "@/lib/get-lang"

function body(formData: FormData, fields: string[]) {
  return Object.fromEntries(fields.map((field) => [field, formData.get(field)]))
}

async function failed(error: unknown): Promise<ActionState> {
  const t = getDictionary(await getLang())
  return {
    status: "error",
    message: error instanceof Error ? error.message : t.requestFailed,
  }
}

async function success(key: MessageKey): Promise<ActionState> {
  const t = getDictionary(await getLang())
  return { status: "success", message: t[key] }
}

export async function createAsset(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  let asset: Asset

  try {
    asset = await apiSend<Asset>(
      "/assets",
      "POST",
      body(formData, [
        "name",
        "category",
        "manufacturer",
        "model",
        "serialNumber",
        "ownerDepartmentId",
        "cabinetId",
        "location",
        "acquiredAt",
        "criticality",
        "condition",
        "notes",
      ])
    )
  } catch (error) {
    return failed(error)
  }

  revalidatePath("/")
  revalidatePath("/assets")
  redirect(`/assets/${asset.id}`)
}

export async function updateAsset(
  id: string,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<Asset>(
      `/assets/${id}`,
      "PATCH",
      body(formData, [
        "name",
        "manufacturer",
        "model",
        "serialNumber",
        "ownerDepartmentId",
        "cabinetId",
        "location",
        "acquiredAt",
        "criticality",
        "notes",
        "updatedAt",
      ])
    )
  } catch (error) {
    return failed(error)
  }

  revalidatePath("/")
  revalidatePath("/assets")
  revalidatePath(`/assets/${id}`)
  return success("assetDetailsUpdated")
}

export async function changeCondition(
  id: string,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<Asset>(
      `/assets/${id}/condition`,
      "POST",
      body(formData, ["condition", "note"])
    )
  } catch (error) {
    return failed(error)
  }

  revalidatePath("/")
  revalidatePath("/assets")
  revalidatePath(`/assets/${id}`)
  revalidatePath("/history")
  return success("assetConditionUpdated")
}

export async function borrowAsset(
  id: string,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<Loan>(
      `/assets/${id}/loans`,
      "POST",
      body(formData, [
        "borrowerDepartmentId",
        "responsiblePerson",
        "purpose",
        "checkedOutAt",
        "destinationLocation",
        "notes",
      ])
    )
  } catch (error) {
    return failed(error)
  }

  revalidatePath("/")
  revalidatePath("/assets")
  revalidatePath(`/assets/${id}`)
  revalidatePath("/borrowings")
  revalidatePath("/history")
  return success("assetCheckedOut")
}

export async function returnAsset(
  loanId: string,
  assetId: string,
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await apiSend<Loan>(
      `/loans/${loanId}/return`,
      "POST",
      body(formData, ["returnedAt", "notes"])
    )
  } catch (error) {
    return failed(error)
  }

  revalidatePath("/")
  revalidatePath("/assets")
  revalidatePath(`/assets/${assetId}`)
  revalidatePath("/borrowings")
  revalidatePath("/history")
  return success("assetReturned")
}
