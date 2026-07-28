"use client"

import { useActionState } from "react"
import { RiAddLine, RiLoaderLine } from "@remixicon/react"

import { createUser } from "@/app/(workspace)/users/actions"
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
import { initialActionState } from "@/lib/action-state"

const roleItems = { ADMIN: "Admin", SUPER_USER: "Super user" }

export function CreateUserSheet() {
  const [state, action, pending] = useActionState(
    createUser,
    initialActionState
  )

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button>
            <RiAddLine data-icon="inline-start" />
            Add user
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create user account</SheetTitle>
          <SheetDescription>
            Admins operate assets. Super users can also manage accounts.
          </SheetDescription>
        </SheetHeader>
        <form action={action} className="flex flex-1 flex-col">
          <div className="px-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="user-name">Name</FieldLabel>
                <Input
                  id="user-name"
                  name="name"
                  autoComplete="name"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="user-username">Username</FieldLabel>
                <Input
                  id="user-username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  minLength={3}
                  maxLength={32}
                  pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}"
                  required
                />
                <FieldDescription>
                  Use 3-32 letters, numbers, dots, underscores, or hyphens.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="user-password">
                  Temporary password
                </FieldLabel>
                <Input
                  id="user-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <FieldDescription>Use 8-128 characters.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="user-role">Role</FieldLabel>
                <Select
                  items={roleItems}
                  name="role"
                  defaultValue="ADMIN"
                  required
                >
                  <SelectTrigger id="user-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_USER">Super user</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
              {pending ? "Creating..." : "Create user"}
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
