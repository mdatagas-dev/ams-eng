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
import {
  categoryLabels,
  criticalityLabels,
  formatDate,
} from "@/lib/asset-format"
import type { Asset, Cabinet, Department } from "@/lib/asset-types"

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b pb-3 last:border-0 last:pb-0">
      <dt className="font-mono text-[0.625rem] tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value || "Not recorded"}</dd>
    </div>
  )
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
        eyebrow={`${asset.assetTag} / ${categoryLabels[asset.category]}`}
        title={asset.name}
        description={`${asset.manufacturer ?? "Unknown manufacturer"}${asset.model ? ` ${asset.model}` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ConditionBadge condition={asset.condition} />
            <Badge variant={activeLoan ? "secondary" : "outline"}>
              {activeLoan
                ? `With ${activeLoan.borrowerDepartment.name}`
                : "Available"}
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment identity</CardTitle>
                  <CardDescription>
                    Manufacturer and registration details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-3">
                    <Detail label="Asset tag" value={asset.assetTag} />
                    <Detail label="Manufacturer" value={asset.manufacturer} />
                    <Detail label="Model" value={asset.model} />
                    <Detail label="Serial number" value={asset.serialNumber} />
                    <Detail
                      label="Acquired"
                      value={formatDate(asset.acquiredAt)}
                    />
                  </dl>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Operational profile</CardTitle>
                  <CardDescription>
                    Ownership, location, and current state.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-3">
                    <Detail label="Owner" value={asset.ownerDepartment.name} />
                    <Detail label="Location" value={asset.location} />
                    <Detail
                      label="Cabinet"
                      value={
                        asset.cabinet
                          ? `${asset.cabinet.code} / ${asset.cabinet.name}`
                          : null
                      }
                    />
                    <Detail
                      label="Category"
                      value={categoryLabels[asset.category]}
                    />
                    <Detail
                      label="Criticality"
                      value={criticalityLabels[asset.criticality]}
                    />
                    <Detail
                      label="Condition"
                      value={<ConditionBadge condition={asset.condition} />}
                    />
                  </dl>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {asset.notes ?? "No notes recorded for this asset."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="borrowing" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Custody history</CardTitle>
                <CardDescription>
                  All department loans for this asset.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Responsible person</TableHead>
                      <TableHead>Checked out</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Actual return</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asset.loans.length ? (
                      asset.loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>{loan.borrowerDepartment.name}</TableCell>
                          <TableCell>{loan.responsiblePerson}</TableCell>
                          <TableCell>{formatDate(loan.checkedOutAt)}</TableCell>
                          <TableCell>
                            {loan.destinationLocation ?? "Not recorded"}
                          </TableCell>
                          <TableCell>
                            {loan.returnedAt
                              ? formatDate(loan.returnedAt)
                              : "Active"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No borrowing history for this asset.
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
                <CardTitle>Asset timeline</CardTitle>
                <CardDescription>
                  Append-only operational history.
                </CardDescription>
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
              <CardTitle>Quick facts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <RiMapPinLine className="text-muted-foreground" />
                <span>{asset.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <RiCalendarLine className="text-muted-foreground" />
                <span>Updated {formatDate(asset.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}
