"use client"

import { startTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RiCloseLine, RiSearchLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { categoryLabels, conditionLabels } from "@/lib/asset-format"
import type {
  AssetCategory,
  AssetCondition,
  Department,
} from "@/lib/asset-types"

const conditions = Object.entries(conditionLabels) as Array<
  [AssetCondition, string]
>
const categories = Object.entries(categoryLabels) as Array<
  [AssetCategory, string]
>
const conditionItems = { all: "All conditions", ...conditionLabels }
const categoryItems = { all: "All categories", ...categoryLabels }
const custodyItems = {
  all: "All custody",
  available: "Available",
  borrowed: "Borrowed",
}

export function AssetFilters({ departments }: { departments: Department[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const departmentItems = {
    all: "All departments",
    ...Object.fromEntries(
      departments.map((department) => [department.id, department.name])
    ),
  }

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value === "all") next.delete(key)
    else next.set(key, value)
    startTransition(() => router.replace(`/assets?${next}`))
  }

  function search(formData: FormData) {
    update("search", String(formData.get("search") ?? "").trim() || "all")
  }

  const hasFilters = searchParams.size > 0

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 xl:flex-row xl:items-center">
      <form action={search} className="flex min-w-0 flex-1 gap-2">
        <Input
          key={searchParams.get("search") ?? ""}
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search tag, asset, model, or serial..."
          aria-label="Search assets"
        />
        <Button type="submit" variant="secondary" size="icon">
          <RiSearchLine />
          <span className="sr-only">Search</span>
        </Button>
      </form>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
        <Select
          items={conditionItems}
          value={searchParams.get("condition") ?? "all"}
          onValueChange={(value) => update("condition", value ?? "all")}
        >
          <SelectTrigger
            className="w-full xl:w-44"
            aria-label="Filter by condition"
          >
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All conditions</SelectItem>
              {conditions.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          items={categoryItems}
          value={searchParams.get("category") ?? "all"}
          onValueChange={(value) => update("category", value ?? "all")}
        >
          <SelectTrigger
            className="w-full xl:w-40"
            aria-label="Filter by category"
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          items={departmentItems}
          value={searchParams.get("departmentId") ?? "all"}
          onValueChange={(value) => update("departmentId", value ?? "all")}
        >
          <SelectTrigger
            className="w-full xl:w-44"
            aria-label="Filter by department"
          >
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          items={custodyItems}
          value={searchParams.get("custody") ?? "all"}
          onValueChange={(value) => update("custody", value ?? "all")}
        >
          <SelectTrigger
            className="w-full xl:w-36"
            aria-label="Filter by custody"
          >
            <SelectValue placeholder="Custody" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All custody</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="borrowed">Borrowed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.replace("/assets")}
        >
          <RiCloseLine data-icon="inline-start" />
          Clear
        </Button>
      ) : null}
    </div>
  )
}
