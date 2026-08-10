"use client"

import { useActionState } from "react"
import {
  RiLoaderLine,
  RiLoginBoxLine,
  RiShieldKeyholeLine,
} from "@remixicon/react"

import { login } from "@/app/login/actions"
import { useI18n } from "@/components/i18n-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { initialLoginState } from "@/lib/login-state"

export function LoginForm() {
  const { t } = useI18n()
  const [state, action, pending] = useActionState(login, initialLoginState)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
          <RiShieldKeyholeLine />
        </div>
        <CardTitle className="text-xl">{t("loginTitle")}</CardTitle>
        <CardDescription>{t("loginDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">{t("username")}</FieldLabel>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                required
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            {state.error ? (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? (
                <RiLoaderLine
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <RiLoginBoxLine data-icon="inline-start" />
              )}
              {pending ? t("signingIn") : t("signIn")}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
