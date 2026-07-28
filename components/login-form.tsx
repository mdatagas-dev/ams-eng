"use client"

import { useActionState } from "react"
import {
  RiLoaderLine,
  RiLoginBoxLine,
  RiShieldKeyholeLine,
} from "@remixicon/react"

import { login } from "@/app/login/actions"
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
  const [state, action, pending] = useActionState(login, initialLoginState)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
          <RiShieldKeyholeLine />
        </div>
        <CardTitle className="text-xl">Sign in to Asset Management</CardTitle>
        <CardDescription>
          Use your Engineering or IT administration account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
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
              <FieldLabel htmlFor="password">Password</FieldLabel>
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
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
