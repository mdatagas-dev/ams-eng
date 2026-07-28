import Link from "next/link"
import {
  RiArrowRightLine,
  RiExchangeBoxLine,
  RiMapPinLine,
} from "@remixicon/react"

import { ConditionBadge } from "@/components/condition-badge"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { categoryLabels, formatDate } from "@/lib/asset-format"
import type { Asset } from "@/lib/asset-types"

export function AssetTable({ assets }: { assets: Asset[] }) {
  if (!assets.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RiExchangeBoxLine />
          </EmptyMedia>
          <EmptyTitle>No matching assets</EmptyTitle>
          <EmptyDescription>
            Adjust the filters or register a new asset.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner / location</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Custody</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Open</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const loan = asset.loans[0]
              return (
                <TableRow key={asset.id}>
                  <TableCell>
                    <Link
                      href={`/assets/${asset.id}`}
                      className="font-medium hover:underline"
                    >
                      {asset.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">
                      {asset.assetTag}
                    </p>
                  </TableCell>
                  <TableCell>{categoryLabels[asset.category]}</TableCell>
                  <TableCell>
                    <p>{asset.ownerDepartment.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {asset.location}
                    </p>
                  </TableCell>
                  <TableCell>
                    <ConditionBadge condition={asset.condition} />
                  </TableCell>
                  <TableCell>
                    {loan ? (
                      <div>
                        <Badge variant="secondary">Borrowed</Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {loan.borrowerDepartment.name}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(asset.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/assets/${asset.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "icon-sm",
                      })}
                    >
                      <RiArrowRightLine />
                      <span className="sr-only">Open {asset.name}</span>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {assets.map((asset) => {
          const loan = asset.loans[0]
          return (
            <Link
              key={asset.id}
              href={`/assets/${asset.id}`}
              className="flex w-full min-w-0 flex-col gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{asset.name}</p>
                  <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">
                    {asset.assetTag} / {categoryLabels[asset.category]}
                  </p>
                </div>
                <ConditionBadge condition={asset.condition} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RiMapPinLine />
                  <span className="truncate">{asset.location}</span>
                </div>
                <div className="text-right text-muted-foreground">
                  {loan ? `With ${loan.borrowerDepartment.name}` : "Available"}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
