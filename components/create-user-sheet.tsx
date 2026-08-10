"use client"

import { useActionState } from "react"
import { RiAddLine, RiLoaderLine } from "@remixicon/react"

import { createUser } from "@/app/(workspace)/users/actions"
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
import { initialActionState } from "@/lib/action-state"

export function CreateUserSheet() {
  const { t } = useI18n()
  const [state, action, pending] = useActionState(
    createUser,
    initialActionState
  )
  const roleItems = { ADMIN: t("roleAdmin"), SUPER_USER: t("roleSuperUser") }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button>
            <RiAddLine data-icon="inline-start" />
            {t("addUser")}
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("createUserAccount")}</SheetTitle>
          <SheetDescription>{t("userSheetDesc")}</SheetDescription>
        </SheetHeader>
        <form action={action} className="flex flex-1 flex-col">
          <div className="px-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="user-name">{t("name")}</FieldLabel>
                <Input
                  id="user-name"
                  name="name"
                  autoComplete="name"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="user-username">
                  {t("username")}
                </FieldLabel>
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
                <FieldDescription>{t("usernameHint")}</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="user-password">
                  {t("temporaryPassword")}
                </FieldLabel>
                <Input
                  id="user-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <FieldDescription>{t("passwordHint")}</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="user-role">{t("role")}</FieldLabel>
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
                      <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                      <SelectItem value="SUPER_USER">
                        {t("roleSuperUser")}
                      </SelectItem>
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
              {pending ? t("creating") : t("createUser")}
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
