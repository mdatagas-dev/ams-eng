import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
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
import { formatDate } from "@/lib/asset-format"
import type { Loan } from "@/lib/asset-types"

export default async function BorrowingsPage() {
  const loans = await apiGet<Loan[]>("/loans")
  const active = loans.filter((loan) => !loan.returnedAt)

  return (
    <>
      <PageHeader
        eyebrow="Custody control"
        title="Inter-department borrowing"
        description="Track who holds shared assets, their destination, and completed custody transfers."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-3xl">
              {active.length}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Active loans</p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-3xl">
              {new Set(active.map((loan) => loan.borrowerDepartmentId)).size}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Borrowing departments
            </p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-3xl">
              {loans.filter((loan) => loan.returnedAt).length}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Returned</p>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Borrowing ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Borrowing department</TableHead>
                  <TableHead>Responsible person</TableHead>
                  <TableHead>Checkout</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length ? (
                  loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <Link
                          href={`/assets/${loan.asset?.id}`}
                          className="font-medium hover:underline"
                        >
                          {loan.asset?.name}
                        </Link>
                        <p className="font-mono text-[0.6875rem] text-muted-foreground">
                          {loan.asset?.assetTag}
                        </p>
                      </TableCell>
                      <TableCell>{loan.borrowerDepartment.name}</TableCell>
                      <TableCell>{loan.responsiblePerson}</TableCell>
                      <TableCell>{formatDate(loan.checkedOutAt)}</TableCell>
                      <TableCell>
                        {loan.destinationLocation ?? "Not recorded"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={loan.returnedAt ? "outline" : "secondary"}
                        >
                          {loan.returnedAt
                            ? `Returned ${formatDate(loan.returnedAt)}`
                            : "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No borrowing records yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
