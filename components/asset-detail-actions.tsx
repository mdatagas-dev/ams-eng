"use client"

import { useActionState } from "react"
import {
  RiExchangeBoxLine,
  RiLoaderLine,
  RiRefreshLine,
  RiToolsLine,
} from "@remixicon/react"

import {
  borrowAsset,
  changeCondition,
  returnAsset,
} from "@/app/(workspace)/actions"
import { AssetFormSheet } from "@/components/asset-form-sheet"
import { useI18n } from "@/components/i18n-provider"
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
import { initialActionState } from "@/lib/action-state"
import { conditionLabels } from "@/lib/asset-format"
import type {
  Asset,
  AssetCondition,
  Cabinet,
  Department,
  Loan,
} from "@/lib/asset-types"

function Feedback({ status, message }: { status: string; message: string }) {
  return message ? (
    <Alert variant={status === "error" ? "destructive" : "default"}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  ) : null
}

function ConditionSheet({ asset }: { asset: Asset }) {
  const { lang, t } = useI18n()
  const [state, action, pending] = useActionState(
    changeCondition.bind(null, asset.id),
    initialActionState
  )
  const conditions = Object.entries(conditionLabels(lang)) as Array<
    [AssetCondition, string]
  >

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline">
            <RiToolsLine data-icon="inline-start" />
            {t("changeCondition")}
          </Button>
        }
      />
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t("changeConditionTitle")}</SheetTitle>
          <SheetDescription>
            {t("recordCondition").replace("{tag}", asset.assetTag)}
          </SheetDescription>
        </SheetHeader>
        <form action={action} className="flex flex-1 flex-col">
          <div className="px-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-condition">
                  {t("newCondition")}
                </FieldLabel>
                <Select
                  key={asset.condition}
                  items={conditionLabels(lang)}
                  name="condition"
                  defaultValue={asset.condition}
                  required
                >
                  <SelectTrigger id="new-condition" className="w-full">
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
              <Field>
                <FieldLabel htmlFor="condition-note">
                  {t("reasonOrObservation")}
                </FieldLabel>
                <Textarea id="condition-note" name="note" rows={4} />
              </Field>
              <Feedback {...state} />
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
              {t("saveCondition")}
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

function BorrowSheet({
  asset,
  departments,
}: {
  asset: Asset
  departments: Department[]
}) {
  const { t } = useI18n()
  const [state, action, pending] = useActionState(
    borrowAsset.bind(null, asset.id),
    initialActionState
  )
  const borrowingDepartments = departments.filter(
    (department) => department.id !== asset.ownerDepartmentId
  )
  const departmentItems = Object.fromEntries(
    borrowingDepartments.map((department) => [department.id, department.name])
  )

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button>
            <RiExchangeBoxLine data-icon="inline-start" />
            {t("borrowAsset")}
          </Button>
        }
      />
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t("borrowTitle").replace("{tag}", asset.assetTag)}</SheetTitle>
          <SheetDescription>{t("assignCustody")}</SheetDescription>
        </SheetHeader>
        <form action={action} className="flex flex-1 flex-col">
          <div className="px-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="borrower-department">
                  {t("borrowingDepartment")}
                </FieldLabel>
                <Select
                  items={departmentItems}
                  name="borrowerDepartmentId"
                  defaultValue={borrowingDepartments[0]?.id}
                  required
                >
                  <SelectTrigger id="borrower-department" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {borrowingDepartments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="responsiblePerson">
                  {t("responsiblePerson")}
                </FieldLabel>
                <Input
                  id="responsiblePerson"
                  name="responsiblePerson"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="purpose">{t("purpose")}</FieldLabel>
                <Input id="purpose" name="purpose" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="destinationLocation">
                  {t("destinationLocation")}
                </FieldLabel>
                <Input
                  id="destinationLocation"
                  name="destinationLocation"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkedOutAt">
                  {t("checkoutDate")}
                </FieldLabel>
                <Input
                  id="checkedOutAt"
                  name="checkedOutAt"
                  type="date"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="borrow-notes">{t("notes")}</FieldLabel>
                <Textarea id="borrow-notes" name="notes" rows={3} />
              </Field>
              <Feedback {...state} />
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
              {t("checkOutAsset")}
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

function ReturnSheet({ asset, loan }: { asset: Asset; loan: Loan }) {
  const { t } = useI18n()
  const [state, action, pending] = useActionState(
    returnAsset.bind(null, loan.id, asset.id),
    initialActionState
  )

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button>
            <RiRefreshLine data-icon="inline-start" />
            {t("returnAsset")}
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {t("returnTitle").replace("{tag}", asset.assetTag)}
          </SheetTitle>
          <SheetDescription>
            {t("closeLoan").replace(
              "{department}",
              loan.borrowerDepartment.name
            )}
          </SheetDescription>
        </SheetHeader>
        <form action={action} className="flex flex-1 flex-col">
          <div className="px-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="returnedAt">{t("returnDate")}</FieldLabel>
                <Input
                  id="returnedAt"
                  name="returnedAt"
                  type="date"
                  min={loan.checkedOutAt.slice(0, 10)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="return-notes">
                  {t("returnNotes")}
                </FieldLabel>
                <Textarea id="return-notes" name="notes" rows={4} />
              </Field>
              <Feedback {...state} />
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
              {t("confirmReturn")}
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

export function AssetDetailActions({
  asset,
  departments,
  cabinets,
}: {
  asset: Asset
  departments: Department[]
  cabinets: Cabinet[]
}) {
  const activeLoan = asset.loans.find((loan) => !loan.returnedAt)

  return (
    <div className="flex flex-wrap gap-2">
      <AssetFormSheet
        asset={asset}
        departments={departments}
        cabinets={cabinets}
      />
      <ConditionSheet asset={asset} />
      {activeLoan ? (
        <ReturnSheet asset={asset} loan={activeLoan} />
      ) : asset.condition === "GOOD" ? (
        <BorrowSheet asset={asset} departments={departments} />
      ) : null}
    </div>
  )
}
