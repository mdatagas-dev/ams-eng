"use client"

import { useActionState } from "react"
import { RiAddLine, RiEditLine, RiLoaderLine } from "@remixicon/react"

import {
  createCabinet,
  updateCabinet,
} from "@/app/(workspace)/inventory/actions"
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { initialActionState } from "@/lib/action-state"
import type { Cabinet } from "@/lib/asset-types"

export function CabinetSheet({ cabinet }: { cabinet?: Cabinet }) {
  const fieldId = cabinet?.id ?? "new"
  const [state, action, pending] = useActionState(
    cabinet ? updateCabinet.bind(null, cabinet.id) : createCabinet,
    initialActionState
  )

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant={cabinet ? "outline" : "default"}
            size={cabinet ? "sm" : "default"}
          >
            {cabinet ? (
              <RiEditLine data-icon="inline-start" />
            ) : (
              <RiAddLine data-icon="inline-start" />
            )}
            {cabinet ? "Edit" : "Add cabinet"}
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{cabinet ? "Edit cabinet" : "Create cabinet"}</SheetTitle>
          <SheetDescription>
            Each active cabinet receives its own permanent checkout QR.
          </SheetDescription>
        </SheetHeader>
        <form action={action} className="flex flex-1 flex-col">
          <div className="px-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`cabinet-code-${fieldId}`}>
                  Code
                </FieldLabel>
                <Input
                  id={`cabinet-code-${fieldId}`}
                  name="code"
                  maxLength={20}
                  pattern="[A-Za-z0-9-]+"
                  autoCapitalize="characters"
                  defaultValue={cabinet?.code}
                  required
                />
                <FieldDescription>
                  Short label printed on the cabinet, such as A or TOOL-01.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor={`cabinet-name-${fieldId}`}>
                  Name
                </FieldLabel>
                <Input
                  id={`cabinet-name-${fieldId}`}
                  name="name"
                  maxLength={100}
                  defaultValue={cabinet?.name}
                  required
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
                : cabinet
                  ? "Save cabinet"
                  : "Create cabinet"}
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
