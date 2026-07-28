"use client"

import { useActionState } from "react"
import { RiAddLine, RiEditLine, RiLoaderLine } from "@remixicon/react"

import { createAsset, updateAsset } from "@/app/(workspace)/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  categoryLabels,
  conditionLabels,
  criticalityLabels,
} from "@/lib/asset-format"
import { initialActionState } from "@/lib/action-state"
import type {
  Asset,
  AssetCategory,
  AssetCondition,
  Cabinet,
  Criticality,
  Department,
} from "@/lib/asset-types"

const categories = Object.entries(categoryLabels) as Array<
  [AssetCategory, string]
>
const conditions = Object.entries(conditionLabels) as Array<
  [AssetCondition, string]
>
const criticalities = Object.entries(criticalityLabels) as Array<
  [Criticality, string]
>

export function AssetFormSheet({
  departments,
  cabinets,
  asset,
}: {
  departments: Department[]
  cabinets: Cabinet[]
  asset?: Asset
}) {
  const action = asset ? updateAsset.bind(null, asset.id) : createAsset
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState
  )
  const departmentItems = Object.fromEntries(
    departments.map((department) => [department.id, department.name])
  )
  const availableCabinets = cabinets.filter(
    (cabinet) => cabinet.active && !cabinet.isStaging
  )
  const cabinetItems = Object.fromEntries(
    availableCabinets.map((cabinet) => [
      cabinet.id,
      `${cabinet.code} / ${cabinet.name}`,
    ])
  )

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant={asset ? "outline" : "default"}>
            {asset ? (
              <RiEditLine data-icon="inline-start" />
            ) : (
              <RiAddLine data-icon="inline-start" />
            )}
            {asset ? "Edit asset" : "Register asset"}
          </Button>
        }
      />
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{asset ? "Edit asset" : "Register asset"}</SheetTitle>
          <SheetDescription>
            {asset
              ? "Update equipment identity and operational information."
              : "Add equipment to the shared Engineering and IT register."}
          </SheetDescription>
        </SheetHeader>
        <form
          key={asset?.updatedAt ?? "new"}
          action={formAction}
          className="flex flex-1 flex-col"
        >
          {asset ? (
            <input type="hidden" name="updatedAt" value={asset.updatedAt} />
          ) : null}
          <div className="px-6 pb-6">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                {asset ? (
                  <Field>
                    <FieldLabel htmlFor="assetTag">Asset ID</FieldLabel>
                    <Input id="assetTag" value={asset.assetTag} readOnly />
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel>Asset ID</FieldLabel>
                    <FieldDescription>
                      Generated automatically after registration.
                    </FieldDescription>
                  </Field>
                )}
                <Field>
                  <FieldLabel htmlFor="name">Asset name</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={asset?.name}
                    required
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="asset-category">Category</FieldLabel>
                  {asset ? (
                    <Input
                      id="asset-category"
                      value={categoryLabels[asset.category]}
                      readOnly
                    />
                  ) : (
                    <Select
                      items={categoryLabels}
                      name="category"
                      defaultValue="TLS"
                      required
                    >
                      <SelectTrigger id="asset-category" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="owner-department">
                    Owner department
                  </FieldLabel>
                  <Select
                    items={departmentItems}
                    name="ownerDepartmentId"
                    defaultValue={
                      asset?.ownerDepartmentId ?? departments[0]?.id
                    }
                    required
                  >
                    <SelectTrigger id="owner-department" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="asset-cabinet">Cabinet</FieldLabel>
                <Select
                  items={cabinetItems}
                  name="cabinetId"
                  defaultValue={asset?.cabinetId ?? availableCabinets[0]?.id}
                  required
                >
                  <SelectTrigger id="asset-cabinet" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableCabinets.map((cabinet) => (
                        <SelectItem key={cabinet.id} value={cabinet.id}>
                          {cabinet.code} / {cabinet.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="location">Home location / area</FieldLabel>
                <Input
                  id="location"
                  name="location"
                  defaultValue={asset?.location}
                  required
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    defaultValue={asset?.manufacturer ?? ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="model">Model</FieldLabel>
                  <Input
                    id="model"
                    name="model"
                    defaultValue={asset?.model ?? ""}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="serialNumber">Serial number</FieldLabel>
                  <Input
                    id="serialNumber"
                    name="serialNumber"
                    defaultValue={asset?.serialNumber ?? ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="acquiredAt">Acquisition date</FieldLabel>
                  <Input
                    id="acquiredAt"
                    name="acquiredAt"
                    type="date"
                    defaultValue={asset?.acquiredAt?.slice(0, 10)}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="asset-criticality">
                    Criticality
                  </FieldLabel>
                  <Select
                    items={criticalityLabels}
                    name="criticality"
                    defaultValue={asset?.criticality ?? "MEDIUM"}
                    required
                  >
                    <SelectTrigger id="asset-criticality" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {criticalities.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                {!asset ? (
                  <Field>
                    <FieldLabel htmlFor="initial-condition">
                      Initial condition
                    </FieldLabel>
                    <Select
                      items={conditionLabels}
                      name="condition"
                      defaultValue="GOOD"
                      required
                    >
                      <SelectTrigger id="initial-condition" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {conditions.map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}
              </div>
              <Field>
                <FieldLabel htmlFor="notes">Notes</FieldLabel>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={asset?.notes ?? ""}
                  rows={4}
                />
              </Field>
              {state.message ? (
                <Alert
                  variant={state.status === "error" ? "destructive" : "default"}
                >
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              ) : null}
            </FieldGroup>
          </div>
          <SheetFooter className="border-t">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <RiLoaderLine
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : null}
              {pending
                ? "Saving..."
                : asset
                  ? "Save changes"
                  : "Register asset"}
            </Button>
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
