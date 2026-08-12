"use client"

import { useActionState, useState } from "react"
import { RiAddLine, RiEditLine, RiLoaderLine } from "@remixicon/react"

import { createAsset, updateAsset } from "@/app/(workspace)/actions"
import { useI18n } from "@/components/i18n-provider"
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
import {
  categoryLabels,
  conditionLabels,
} from "@/lib/asset-format"
import { initialActionState } from "@/lib/action-state"
import type {
  Asset,
  AssetCategory,
  AssetCondition,
  Cabinet,
  Department,
} from "@/lib/asset-types"

export function AssetFormSheet({
  departments,
  cabinets,
  asset,
}: {
  departments: Department[]
  cabinets: Cabinet[]
  asset?: Asset
}) {
  const { lang, t } = useI18n()
  const action = asset ? updateAsset.bind(null, asset.id) : createAsset
  const [category, setCategory] = useState<AssetCategory>(
    asset?.category ?? "TLS"
  )
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState
  )
  // UNIT_SNI is not registerable; it stays in categoryLabels for filters and
  // for existing assets, which show category as a read-only field.
  const categories = (
    Object.entries(categoryLabels(lang)) as Array<[AssetCategory, string]>
  ).filter(([value]) => value !== "UNIT_SNI")
  const conditions = Object.entries(conditionLabels(lang)) as Array<
    [AssetCondition, string]
  >
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
            {asset ? t("editAsset") : t("registerAsset")}
          </Button>
        }
      />
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{asset ? t("editAsset") : t("registerAsset")}</SheetTitle>
          <SheetDescription>
            {asset ? t("editAssetDesc") : t("registerAssetDesc")}
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
                    <FieldLabel htmlFor="assetTag">{t("assetId")}</FieldLabel>
                    <Input id="assetTag" value={asset.assetTag} readOnly />
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel>{t("assetId")}</FieldLabel>
                    <FieldDescription>{t("assetIdAuto")}</FieldDescription>
                  </Field>
                )}
                <Field>
                  <FieldLabel htmlFor="name">{t("assetName")}</FieldLabel>
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
                  <FieldLabel htmlFor="asset-category">
                    {t("category")}
                  </FieldLabel>
                  {asset ? (
                    <Input
                      id="asset-category"
                      value={categoryLabels(lang)[asset.category]}
                      readOnly
                    />
                  ) : (
                    <Select
                      items={Object.fromEntries(categories)}
                      name="category"
                      defaultValue="TLS"
                      onValueChange={(value) =>
                        setCategory((value as AssetCategory) ?? "TLS")
                      }
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
                    {t("ownerDepartment")}
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
              {category !== "UNIT_SNI" ? (
                <Field>
                  <FieldLabel htmlFor="asset-cabinet">{t("cabinet")}</FieldLabel>
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
              ) : null}
              <Field>
                <FieldLabel>{t("homeLocation")}</FieldLabel>
                <Input value="Gudang Engineering / IT" readOnly />
                <input
                  type="hidden"
                  name="location"
                  value="Gudang Engineering / IT"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="manufacturer">
                    {t("manufacturer")}
                  </FieldLabel>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    defaultValue={asset?.manufacturer ?? ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="model">{t("model")}</FieldLabel>
                  <Input
                    id="model"
                    name="model"
                    defaultValue={asset?.model ?? ""}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="serialNumber">
                    {t("serialNumber")}
                  </FieldLabel>
                  <Input
                    id="serialNumber"
                    name="serialNumber"
                    defaultValue={asset?.serialNumber ?? ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="acquiredAt">{t("acquiredAt")}</FieldLabel>
                  <Input
                    id="acquiredAt"
                    name="acquiredAt"
                    type="date"
                    defaultValue={asset?.acquiredAt?.slice(0, 10)}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {!asset ? (
                  <Field>
                    <FieldLabel htmlFor="initial-condition">
                      {t("initialCondition")}
                    </FieldLabel>
                    <Select
                      items={conditionLabels(lang)}
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
                ? t("saving")
                : asset
                  ? t("saveChanges")
                  : t("registerAsset")}
            </Button>
            <SheetClose render={<Button type="button" variant="outline" />}>
              {t("cancel")}
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
