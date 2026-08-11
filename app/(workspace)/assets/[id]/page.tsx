import { RiCalendarLine, RiMapPinLine } from "@remixicon/react"
import { notFound } from "next/navigation"

import { ActivityFeed } from "@/components/activity-feed"
import { AssetDetailActions } from "@/components/asset-detail-actions"
import { ConditionBadge } from "@/components/condition-badge"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiRequestError, apiGet } from "@/lib/api"
import { categoryLabels, formatDate } from "@/lib/asset-format"
import type { Asset, Cabinet, Department } from "@/lib/asset-types"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b pb-3 last:border-0 last:pb-0">
      <dt className="font-mono text-[0.625rem] tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  )
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const lang = await getLang()
  const t = getDictionary(lang)
  const { id } = await params
  let asset: Asset
  let departments: Department[]
  let cabinets: Cabinet[]

  try {
    ;[asset, departments, cabinets] = await Promise.all([
      apiGet<Asset>(`/assets/${id}`),
      apiGet<Department[]>("/departments"),
      apiGet<Cabinet[]>("/inventory/cabinets"),
    ])
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound()
    throw error
  }
  const activeLoan = asset.loans.find((loan) => !loan.returnedAt)

  return (
    <>
      <PageHeader
        eyebrow={`${asset.assetTag} / ${categoryLabels(lang)[asset.category]}`}
        title={asset.name}
        description={`${asset.manufacturer ?? t.unknownManufacturer}${asset.model ? ` ${asset.model}` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ConditionBadge condition={asset.condition} />
            <Badge variant={activeLoan ? "secondary" : "outline"}>
              {activeLoan
                ? t.tableWithDepartment.replace(
                    "{department}",
                    activeLoan.borrowerDepartment.name
                  )
                : t.available}
            </Badge>
          </div>
        }
      />

      <AssetDetailActions
        asset={asset}
        departments={departments}
        cabinets={cabinets}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">{t.tabOverview}</TabsTrigger>
            <TabsTrigger value="borrowing">{t.tabBorrowing}</TabsTrigger>
            <TabsTrigger value="history">{t.tabHistory}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t.detailIdentity}</CardTitle>
                  <CardDescription>{t.detailIdentityDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-3">
                    <Detail
                      label={t.detailAssetTag}
                      value={asset.assetTag}
                    />
                    <Detail
                      label={t.detailManufacturer}
                      value={asset.manufacturer ?? t.notRecorded}
                    />
                    <Detail
                      label={t.detailModel}
                      value={asset.model ?? t.notRecorded}
                    />
                    <Detail
                      label={t.detailSerialNumber}
                      value={asset.serialNumber ?? t.notRecorded}
                    />
                    <Detail
                      label={t.detailAcquired}
                      value={formatDate(asset.acquiredAt, lang)}
                    />
                  </dl>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t.detailProfile}</CardTitle>
                  <CardDescription>{t.detailProfileDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-3">
                    <Detail
                      label={t.detailOwner}
                      value={asset.ownerDepartment.name}
                    />
                    <Detail
                      label={t.detailLocation}
                      value={asset.location}
                    />
                    <Detail
                      label={t.detailCabinet}
                      value={
                        asset.cabinet
                          ? `${asset.cabinet.code} / ${asset.cabinet.name}`
                          : t.notRecorded
                      }
                    />
                    <Detail
                      label={t.detailCategory}
                      value={categoryLabels(lang)[asset.category]}
                    />
                    <Detail
                      label={t.detailCondition}
                      value={<ConditionBadge condition={asset.condition} />}
                    />
                  </dl>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t.detailNotes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {asset.notes ?? t.detailNoNotes}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="borrowing" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.detailCustodyHistory}</CardTitle>
                <CardDescription>{t.detailCustodyHistoryDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.detailDepartment}</TableHead>
                      <TableHead>{t.detailResponsible}</TableHead>
                      <TableHead>{t.detailCheckedOut}</TableHead>
                      <TableHead>{t.detailDestination}</TableHead>
                      <TableHead>{t.detailActualReturn}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asset.loans.length ? (
                      asset.loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>
                            {loan.borrowerDepartment.name}
                          </TableCell>
                          <TableCell>{loan.responsiblePerson}</TableCell>
                          <TableCell>{formatDate(loan.checkedOutAt, lang)}</TableCell>
                          <TableCell>
                            {loan.destinationLocation ?? t.notRecorded}
                          </TableCell>
                          <TableCell>
                            {loan.returnedAt
                              ? formatDate(loan.returnedAt, lang)
                              : t.active}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          {t.detailNoBorrowingHistory}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.detailTimeline}</CardTitle>
                <CardDescription>{t.detailTimelineDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed activities={asset.activities ?? []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <aside className="flex flex-col gap-3">
          <Card size="sm">
            <CardHeader>
              <CardTitle>{t.detailQuickFacts}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <RiMapPinLine className="text-muted-foreground" />
                <span>{asset.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <RiCalendarLine className="text-muted-foreground" />
                <span>
                  {t.detailUpdatedAt.replace(
                    "{date}",
                    formatDate(asset.updatedAt, lang)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}
