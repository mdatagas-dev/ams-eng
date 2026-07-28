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

export default async function UsersPage() {
  const currentUser = await getCurrentUser()
  if (currentUser.role !== "SUPER_USER") redirect("/")
  const users = await apiGet<ManagedUser[]>("/users")

  return (
    <>
      <PageHeader
        eyebrow="Access control"
        title="User accounts"
        description="Create accounts and control access to the asset management workspace."
        actions={<CreateUserSheet />}
      />
      <Card>
        <CardHeader>
          <CardTitle>{users.length} accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                        {user.role === "SUPER_USER" ? "Super user" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.active ? "secondary" : "destructive"}
                      >
                        {user.active ? "Active" : "Inactive"}
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
                          {user.active ? "Deactivate" : "Activate"}
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
