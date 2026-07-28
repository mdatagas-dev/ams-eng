import { AssetFilters } from "@/components/asset-filters"
import { AssetFormSheet } from "@/components/asset-form-sheet"
import { AssetTable } from "@/components/asset-table"
import { PageHeader } from "@/components/page-header"
import { apiGet } from "@/lib/api"
import type { Asset, Cabinet, Department } from "@/lib/asset-types"

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = await searchParams
  const query = new URLSearchParams()

  for (const key of [
    "search",
    "condition",
    "category",
    "departmentId",
    "custody",
  ]) {
    const value = filters[key]
    if (typeof value === "string") query.set(key, value)
  }

  const [assets, departments, cabinets] = await Promise.all([
    apiGet<Asset[]>(`/assets${query.size ? `?${query}` : ""}`),
    apiGet<Department[]>("/departments"),
    apiGet<Cabinet[]>("/inventory/cabinets"),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Master data"
        title="Asset register"
        description="Search equipment, inspect condition, and see current custody across operating departments."
        actions={
          <AssetFormSheet departments={departments} cabinets={cabinets} />
        }
      />
      <AssetFilters departments={departments} />
      <div
        className="flex items-center justify-between gap-4"
        aria-live="polite"
      >
        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-medium text-foreground">
            {assets.length}
          </span>{" "}
          assets shown
        </p>
      </div>
      <AssetTable assets={assets} />
    </>
  )
}
