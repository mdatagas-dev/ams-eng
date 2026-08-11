import { redirect } from "next/navigation"

import { setUserActive } from "./actions"
import { CreateUserSheet } from "@/components/create-user-sheet"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiGet } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"
import type { ManagedUser } from "@/lib/auth-types"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

export default async function UsersPage() {
  const lang = await getLang()
  const t = getDictionary(lang)
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect("/login")
  if (currentUser.role !== "SUPER_USER") redirect("/")
  const users = await apiGet<ManagedUser[]>("/users")

  return (
    <>
      <PageHeader
        eyebrow={t.usersEyebrow}
        title={t.usersTitle}
        description={t.usersDescription}
        actions={<CreateUserSheet />}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t.accounts.replace("{n}", String(users.length))}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.user}</TableHead>
                <TableHead>{t.role}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const self = user.id === currentUser.id
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === "SUPER_USER"
                          ? t.roleSuperUser
                          : t.roleAdmin}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.active ? "secondary" : "destructive"}
                      >
                        {user.active ? t.active : t.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <form
                        action={setUserActive.bind(null, user.id, !user.active)}
                      >
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={self}
                        >
                          {user.active ? t.deactivate : t.activate}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
