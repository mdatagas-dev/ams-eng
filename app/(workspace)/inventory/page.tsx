import { headers } from "next/headers"
import Link from "next/link"
import QRCode from "qrcode-svg"

import {
  setCabinetActive,
  setStockStatus,
} from "@/app/(workspace)/inventory/actions"
import { CabinetSheet } from "@/components/create-cabinet-sheet"
import { PageHeader } from "@/components/page-header"
import { PrintButton } from "@/components/print-button"
import { StockItemSheet } from "@/components/stock-item-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiGet } from "@/lib/api"
import { formatDateTime } from "@/lib/asset-format"
import type { InventoryData } from "@/lib/inventory-types"

function stockTotals(item: InventoryData["items"][number]) {
  return item.stocks.reduce(
    (totals, stock) => ({
      good: totals.good + stock.goodQuantity,
      bad: totals.bad + stock.badQuantity,
    }),
    { good: 0, bad: 0 }
  )
}

const pageSize = 25

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [data, requestHeaders, filters] = await Promise.all([
    apiGet<InventoryData>("/inventory"),
    headers(),
    searchParams,
  ])
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http"
  const origin = `${protocol}://${host ?? "localhost:3000"}`
  const checkoutCabinets = data.cabinets.filter((cabinet) => !cabinet.isStaging)
  const unclassified = data.items.filter(
    (item) => item.status === "UNCLASSIFIED"
  ).length
  const pageCount = Math.max(1, Math.ceil(data.items.length / pageSize))
  const requestedPage = Number(filters.page)
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1
  const visibleItems = data.items.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          eyebrow="Cabinet operations"
          title="Inventory and checkout"
          description="Classify July stock, distribute cabinet balances, and print each cabinet's permanent checkout QR."
          actions={
            <div className="flex flex-wrap gap-2">
              <PrintButton />
              <CabinetSheet />
            </div>
          }
        />
      </div>

      <section aria-labelledby="cabinet-qrs">
        <div className="mb-4 print:hidden">
          <h2 id="cabinet-qrs" className="text-lg font-semibold">
            Cabinet QR labels
          </h2>
          <p className="text-sm text-muted-foreground">
            A QR remains valid when its cabinet name or code changes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-2">
          {checkoutCabinets.map((cabinet) => {
            const checkoutUrl = `${origin}/checkout/cabinet/${cabinet.id}`
            const svg = new QRCode({
              content: checkoutUrl,
              padding: 4,
              width: 192,
              height: 192,
              join: true,
              container: "svg-viewbox",
              xmlDeclaration: false,
            }).svg()

            return (
              <Card
                key={cabinet.id}
                className={
                  cabinet.active
                    ? "break-inside-avoid"
                    : "break-inside-avoid print:hidden"
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{cabinet.code}</CardTitle>
                      <CardDescription>{cabinet.name}</CardDescription>
                    </div>
                    <Badge variant={cabinet.active ? "secondary" : "outline"}>
                      {cabinet.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div
                    className="size-48 [&_svg]:size-48"
                    role="img"
                    aria-label={`Checkout QR for ${cabinet.code}`}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                  <p className="w-full text-center font-mono text-[0.625rem] break-all text-muted-foreground">
                    {checkoutUrl}
                  </p>
                  <form
                    action={setCabinetActive.bind(
                      null,
                      cabinet.id,
                      !cabinet.active
                    )}
                    className="print:hidden"
                  >
                    <Button type="submit" variant="outline" size="sm">
                      {cabinet.active ? "Disable checkout" : "Enable checkout"}
                    </Button>
                  </form>
                  <div className="print:hidden">
                    <CabinetSheet cabinet={cabinet} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 print:hidden">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Imported catalogue</CardDescription>
            <CardTitle className="font-mono text-2xl">
              {data.items.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Awaiting classification</CardDescription>
            <CardTitle className="font-mono text-2xl">{unclassified}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Coded cabinet assets</CardDescription>
            <CardTitle className="font-mono text-2xl">
              {checkoutCabinets.reduce(
                (total, cabinet) => total + cabinet._count.assets,
                0
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>July 2026 stock catalogue</CardTitle>
          <CardDescription>
            Imported rows stay unavailable for self-checkout until classified as
            consumable and transferred out of UNASSIGNED.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Good</TableHead>
                <TableHead>Bad</TableHead>
                <TableHead>Cabinets</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.map((item) => {
                const totals = stockTotals(item)
                const nextStatus =
                  item.status === "UNCLASSIFIED" ? "CONSUMABLE" : "UNCLASSIFIED"
                return (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-96">
                      <p className="font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.supplier}
                        {item.specification ? ` / ${item.specification}` : ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "CONSUMABLE" ? "secondary" : "outline"
                        }
                      >
                        {item.status === "CONSUMABLE"
                          ? "Consumable"
                          : "Unclassified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{totals.good}</TableCell>
                    <TableCell className="font-mono">{totals.bad}</TableCell>
                    <TableCell className="max-w-64 text-xs text-muted-foreground">
                      {item.stocks
                        .filter(
                          (stock) => stock.goodQuantity || stock.badQuantity
                        )
                        .map(
                          (stock) =>
                            `${stock.cabinet.code}: ${stock.goodQuantity}/${stock.badQuantity}`
                        )
                        .join(", ") || "No balance"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <form
                          action={setStockStatus.bind(
                            null,
                            item.id,
                            nextStatus
                          )}
                        >
                          <Button type="submit" variant="outline" size="sm">
                            {nextStatus === "CONSUMABLE"
                              ? "Mark consumable"
                              : "Mark unclassified"}
                          </Button>
                        </form>
                        <StockItemSheet item={item} cabinets={data.cabinets} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {pageCount}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/inventory?page=${page - 1}`} />}
                >
                  Previous
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
              )}
              {page < pageCount ? (
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/inventory?page=${page + 1}`} />}
                >
                  Next
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Recent stock movements</CardTitle>
          <CardDescription>
            Latest imports, transfers, adjustments, and permanent issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Cabinet</TableHead>
                <TableHead>Good</TableHead>
                <TableHead>Bad</TableHead>
                <TableHead>Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{formatDateTime(movement.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{movement.type}</Badge>
                  </TableCell>
                  <TableCell>{movement.item.name}</TableCell>
                  <TableCell>{movement.cabinet.code}</TableCell>
                  <TableCell className="font-mono">
                    {movement.goodDelta > 0 ? "+" : ""}
                    {movement.goodDelta}
                  </TableCell>
                  <TableCell className="font-mono">
                    {movement.badDelta > 0 ? "+" : ""}
                    {movement.badDelta}
                  </TableCell>
                  <TableCell>{movement.actorName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
