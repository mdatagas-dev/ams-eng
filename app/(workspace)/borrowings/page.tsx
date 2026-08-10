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
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

export default async function BorrowingsPage() {
  const lang = await getLang()
  const t = getDictionary(lang)
  const loans = await apiGet<Loan[]>("/loans")
  const active = loans.filter((loan) => !loan.returnedAt)

  return (
    <>
      <PageHeader
        eyebrow={t.borrowingsEyebrow}
        title={t.borrowingsTitle}
        description={t.borrowingsDescription}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-3xl">
              {active.length}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{t.activeLoans}</p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-3xl">
              {new Set(active.map((loan) => loan.borrowerDepartmentId)).size}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t.borrowingDepartments}
            </p>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="font-mono text-3xl">
              {loans.filter((loan) => loan.returnedAt).length}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{t.returned}</p>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t.borrowingLedger}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.tableAsset}</TableHead>
                  <TableHead>{t.borrowingDepartment}</TableHead>
                  <TableHead>{t.detailResponsible}</TableHead>
                  <TableHead>{t.detailCheckedOut}</TableHead>
                  <TableHead>{t.detailDestination}</TableHead>
                  <TableHead>{t.status}</TableHead>
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
                      <TableCell>{formatDate(loan.checkedOutAt, lang)}</TableCell>
                      <TableCell>
                        {loan.destinationLocation ?? t.notRecorded}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={loan.returnedAt ? "outline" : "secondary"}
                        >
                          {loan.returnedAt
                            ? t.returnedOn.replace(
                                "{date}",
                                formatDate(loan.returnedAt, lang)
                              )
                            : t.active}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t.noBorrowingRecords}
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
