"use client"

import { useActionState, useState } from "react"
import { RiCheckboxCircleLine, RiLoaderLine } from "@remixicon/react"

import { checkoutFromCabinet } from "@/app/checkout/actions"
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

function itemLabel(item: CabinetCheckoutData["items"][number]) {
  const detail =
    item.kind === "CONSUMABLE"
      ? `${item.specification ?? "No specification"} / import row ${item.sourceRow}`
      : categoryLabels[item.category]
  return `${item.name} / ${detail} (${item.available} available)`
}

export function CabinetCheckoutForm({
  data,
  checkoutId,
}: {
  data: CabinetCheckoutData
  checkoutId: string
}) {
  const [selectedKey, setSelectedKey] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [state, action, pending] = useActionState(
    checkoutFromCabinet.bind(null, data.cabinet.id),
    initialActionState
  )
  const selected = data.items.find((item) => itemKey(item) === selectedKey)
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
          <FieldLabel htmlFor="checkout-item">Item</FieldLabel>
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
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Consumables</SelectLabel>
                {data.items.map((item) =>
                  item.kind === "CONSUMABLE" ? (
                    <SelectItem key={itemKey(item)} value={itemKey(item)}>
                      {itemLabel(item)}
                    </SelectItem>
                  ) : null
                )}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Borrowable assets</SelectLabel>
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
                    ? "Permanent issue"
                    : categoryLabels[selected.category]}
                </Badge>
                <span>
                  {selected.kind === "CONSUMABLE"
                    ? "Stock will not be returned."
                    : "Admin will record the return."}
                </span>
              </>
            ) : (
              "Choose the item stored in this cabinet."
            )}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="checkout-quantity">Quantity</FieldLabel>
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
            Maximum currently available: {available ?? 0}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="responsible-person">Your name</FieldLabel>
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
          <FieldLabel htmlFor="borrower-department">Department</FieldLabel>
          <Select
            items={departmentItems}
            name="borrowerDepartmentId"
            value={departmentId}
            onValueChange={(value) => setDepartmentId(value ?? "")}
            disabled={!selected || completed}
            required
          >
            <SelectTrigger id="borrower-department" className="w-full">
              <SelectValue placeholder="Select your department" />
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
          <FieldLabel htmlFor="checkout-purpose">Purpose</FieldLabel>
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
            Exact destination location
          </FieldLabel>
          <Input
            id="destination-location"
            name="destinationLocation"
            maxLength={150}
            placeholder="Building, room, line, or workstation"
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
        {pending ? "Checking out..." : "Confirm checkout"}
      </Button>
    </form>
  )
}
