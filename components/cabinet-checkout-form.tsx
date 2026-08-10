"use client"

import { useActionState, useState } from "react"
import { RiCheckboxCircleLine, RiLoaderLine } from "@remixicon/react"

import { checkoutFromCabinet } from "@/app/checkout/actions"
import { useI18n } from "@/components/i18n-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { initialActionState } from "@/lib/action-state"
import { categoryLabels } from "@/lib/asset-format"
import type { CabinetCheckoutData } from "@/lib/inventory-types"

function itemKey(item: CabinetCheckoutData["items"][number]) {
  return item.kind === "CONSUMABLE"
    ? `stock:${item.itemId}`
    : `asset:${item.category}:${item.name}`
}

export function CabinetCheckoutForm({
  data,
  checkoutId,
}: {
  data: CabinetCheckoutData
  checkoutId: string
}) {
  const { lang, t } = useI18n()
  const [selectedKey, setSelectedKey] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [state, action, pending] = useActionState(
    checkoutFromCabinet.bind(null, data.cabinet.id),
    initialActionState
  )
  const selected = data.items.find((item) => itemKey(item) === selectedKey)
  function itemLabel(item: CabinetCheckoutData["items"][number]) {
    const detail =
      item.kind === "CONSUMABLE"
        ? `${item.specification ?? t("noSpecification")} / ${t("importRow").replace("{row}", String(item.sourceRow))}`
        : categoryLabels(lang)[item.category]
    return `${item.name} / ${detail} (${t("availableCount").replace("{n}", String(item.available))})`
  }
  const itemLabels = Object.fromEntries(
    data.items.map((item) => [itemKey(item), itemLabel(item)])
  )
  const departmentItems = Object.fromEntries(
    data.departments.map((department) => [department.id, department.name])
  )
  const available =
    selected?.kind === "DURABLE" && departmentId
      ? selected.availableByDepartment[departmentId]
      : selected?.available
  const completed = state.status === "success"

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="checkoutId" value={checkoutId} />
      <input type="hidden" name="kind" value={selected?.kind ?? ""} />
      <input
        type="hidden"
        name="itemId"
        value={selected?.kind === "CONSUMABLE" ? selected.itemId : ""}
      />
      <input
        type="hidden"
        name="category"
        value={selected?.kind === "DURABLE" ? selected.category : ""}
      />
      <input type="hidden" name="itemName" value={selected?.name ?? ""} />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="checkout-item">{t("item")}</FieldLabel>
          <Select
            items={itemLabels}
            value={selectedKey}
            onValueChange={(value) => {
              setSelectedKey(value ?? "")
              setDepartmentId("")
            }}
            disabled={completed}
            required
          >
            <SelectTrigger id="checkout-item" className="w-full">
              <SelectValue placeholder={t("selectItem")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t("consumables")}</SelectLabel>
                {data.items.map((item) =>
                  item.kind === "CONSUMABLE" ? (
                    <SelectItem key={itemKey(item)} value={itemKey(item)}>
                      {itemLabel(item)}
                    </SelectItem>
                  ) : null
                )}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>{t("borrowableAssets")}</SelectLabel>
                {data.items.map((item) =>
                  item.kind === "DURABLE" ? (
                    <SelectItem key={itemKey(item)} value={itemKey(item)}>
                      {itemLabel(item)}
                    </SelectItem>
                  ) : null
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription className="flex flex-wrap items-center gap-2">
            {selected ? (
              <>
                <Badge variant="outline">
                  {selected.kind === "CONSUMABLE"
                    ? t("permanentIssue")
                    : categoryLabels(lang)[selected.category]}
                </Badge>
                <span>
                  {selected.kind === "CONSUMABLE"
                    ? t("stockNotReturned")
                    : t("adminRecordsReturn")}
                </span>
              </>
            ) : (
              t("chooseItem")
            )}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="checkout-quantity">{t("quantity")}</FieldLabel>
          <Input
            key={`${selectedKey || "none"}:${departmentId}`}
            id="checkout-quantity"
            name="quantity"
            type="number"
            min={1}
            max={available}
            defaultValue={1}
            disabled={!selected || !departmentId || !available || completed}
            required
          />
          <FieldDescription>
            {t("maxAvailable").replace("{n}", String(available ?? 0))}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="responsible-person">{t("yourName")}</FieldLabel>
          <Input
            id="responsible-person"
            name="responsiblePerson"
            autoComplete="name"
            maxLength={150}
            disabled={completed}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="borrower-department">
            {t("department")}
          </FieldLabel>
          <Select
            items={departmentItems}
            name="borrowerDepartmentId"
            value={departmentId}
            onValueChange={(value) => setDepartmentId(value ?? "")}
            disabled={!selected || completed}
            required
          >
            <SelectTrigger id="borrower-department" className="w-full">
              <SelectValue placeholder={t("selectDepartment")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {data.departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="checkout-purpose">{t("purpose")}</FieldLabel>
          <Textarea
            id="checkout-purpose"
            name="purpose"
            maxLength={250}
            rows={3}
            disabled={completed}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="destination-location">
            {t("exactDestination")}
          </FieldLabel>
          <Input
            id="destination-location"
            name="destinationLocation"
            maxLength={150}
            placeholder={t("destinationPlaceholder")}
            disabled={completed}
            required
          />
        </Field>

        {state.message ? (
          <Alert variant={state.status === "error" ? "destructive" : "default"}>
            {state.status === "success" ? (
              <RiCheckboxCircleLine data-icon="inline-start" />
            ) : null}
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={
          pending || !selected || !departmentId || !available || completed
        }
      >
        {pending ? (
          <RiLoaderLine data-icon="inline-start" className="animate-spin" />
        ) : null}
        {pending ? t("checkingOut") : t("confirmCheckout")}
      </Button>
    </form>
  )
}
