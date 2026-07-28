"use client"

import { useActionState } from "react"
import { RiLoaderLine, RiSettings3Line } from "@remixicon/react"

import { adjustStock, transferStock } from "@/app/(workspace)/inventory/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { initialActionState } from "@/lib/action-state"
import type { Cabinet } from "@/lib/asset-types"
import type { StockItem } from "@/lib/inventory-types"

function Feedback({ status, message }: { status: string; message: string }) {
  return message ? (
    <Alert variant={status === "error" ? "destructive" : "default"}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null
}

export function StockItemSheet({
  item,
  cabinets,
}: {
  item: StockItem
  cabinets: Cabinet[]
}) {
  const [transferState, transferAction, transferPending] = useActionState(
    transferStock.bind(null, item.id),
    initialActionState
  )
  const [adjustState, adjustAction, adjustPending] = useActionState(
    adjustStock.bind(null, item.id),
    initialActionState
  )
  const sourceStocks = item.stocks.filter(
    (stock) => stock.goodQuantity || stock.badQuantity
  )
  const destinationCabinets = cabinets.filter(
    (cabinet) => cabinet.active && !cabinet.isStaging
  )
  const sourceItems = Object.fromEntries(
    sourceStocks.map((stock) => [
      stock.cabinetId,
      `${stock.cabinet.code} / ${stock.goodQuantity} good, ${stock.badQuantity} bad`,
    ])
  )
  const destinationItems = Object.fromEntries(
    destinationCabinets.map((cabinet) => [cabinet.id, cabinet.code])
  )
  const cabinetItems = Object.fromEntries(
    cabinets.map((cabinet) => [cabinet.id, cabinet.code])
  )

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <RiSettings3Line data-icon="inline-start" />
            Manage
          </Button>
        }
      />
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{item.name}</SheetTitle>
          <SheetDescription>
            Transfer cabinet balances or record a verified stock adjustment.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-8 px-6 pb-6">
          <form action={transferAction} className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold">Transfer stock</h3>
              <p className="text-sm text-muted-foreground">
                Move good or bad quantities without changing the total.
              </p>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`source-${item.id}`}>From</FieldLabel>
                <Select
                  items={sourceItems}
                  name="fromCabinetId"
                  defaultValue={sourceStocks[0]?.cabinetId}
                  required
                >
                  <SelectTrigger id={`source-${item.id}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sourceStocks.map((stock) => (
                        <SelectItem
                          key={stock.cabinetId}
                          value={stock.cabinetId}
                        >
                          {stock.cabinet.code} / {stock.goodQuantity} good,{" "}
                          {stock.badQuantity} bad
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor={`destination-${item.id}`}>To</FieldLabel>
                <Select
                  items={destinationItems}
                  name="toCabinetId"
                  defaultValue={destinationCabinets[0]?.id}
                  required
                >
                  <SelectTrigger
                    id={`destination-${item.id}`}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {destinationCabinets.map((cabinet) => (
                        <SelectItem key={cabinet.id} value={cabinet.id}>
                          {cabinet.code} / {cabinet.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor={`transfer-good-${item.id}`}>
                    Good quantity
                  </FieldLabel>
                  <Input
                    id={`transfer-good-${item.id}`}
                    name="goodQuantity"
                    type="number"
                    min={0}
                    defaultValue={0}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`transfer-bad-${item.id}`}>
                    Bad quantity
                  </FieldLabel>
                  <Input
                    id={`transfer-bad-${item.id}`}
                    name="badQuantity"
                    type="number"
                    min={0}
                    defaultValue={0}
                    required
                  />
                </Field>
              </div>
              <Feedback {...transferState} />
            </FieldGroup>
            <Button
              type="submit"
              disabled={transferPending || !sourceStocks.length}
            >
              {transferPending ? (
                <RiLoaderLine
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : null}
              {transferPending ? "Transferring..." : "Transfer"}
            </Button>
          </form>

          <Separator />

          <form action={adjustAction} className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold">Stock adjustment</h3>
              <p className="text-sm text-muted-foreground">
                Use signed quantities after a physical count.
              </p>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`adjust-cabinet-${item.id}`}>
                  Cabinet
                </FieldLabel>
                <Select
                  items={cabinetItems}
                  name="cabinetId"
                  defaultValue={cabinets[0]?.id}
                  required
                >
                  <SelectTrigger
                    id={`adjust-cabinet-${item.id}`}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {cabinets.map((cabinet) => (
                        <SelectItem key={cabinet.id} value={cabinet.id}>
                          {cabinet.code} / {cabinet.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor={`adjust-good-${item.id}`}>
                    Good change
                  </FieldLabel>
                  <Input
                    id={`adjust-good-${item.id}`}
                    name="goodDelta"
                    type="number"
                    defaultValue={0}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`adjust-bad-${item.id}`}>
                    Bad change
                  </FieldLabel>
                  <Input
                    id={`adjust-bad-${item.id}`}
                    name="badDelta"
                    type="number"
                    defaultValue={0}
                    required
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor={`adjust-note-${item.id}`}>
                  Reason
                </FieldLabel>
                <Textarea
                  id={`adjust-note-${item.id}`}
                  name="note"
                  maxLength={500}
                  required
                />
              </Field>
              <Feedback {...adjustState} />
            </FieldGroup>
            <Button type="submit" disabled={adjustPending}>
              {adjustPending ? (
                <RiLoaderLine
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : null}
              {adjustPending ? "Saving..." : "Save adjustment"}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
