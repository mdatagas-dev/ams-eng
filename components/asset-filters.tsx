"use client"

import { startTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RiCloseLine, RiSearchLine } from "@remixicon/react"

import { useI18n } from "@/components/i18n-provider"
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

export function AssetFilters({ departments }: { departments: Department[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang, t } = useI18n()
  const conditions = Object.entries(conditionLabels(lang)) as Array<
    [AssetCondition, string]
  >
  const categories = Object.entries(categoryLabels(lang)) as Array<
    [AssetCategory, string]
  >
  const conditionItems = { all: t("allConditions"), ...conditionLabels(lang) }
  const categoryItems = { all: t("allCategories"), ...categoryLabels(lang) }
  const custodyItems = {
    all: t("allCustody"),
    available: t("available"),
    borrowed: t("tableBorrowed"),
  }
  const departmentItems = {
    all: t("allDepartments"),
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
          placeholder={t("filterPlaceholder")}
          aria-label={t("filterSearchAria")}
        />
        <Button type="submit" variant="secondary" size="icon">
          <RiSearchLine />
          <span className="sr-only">{t("search")}</span>
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
            aria-label={t("filterByCondition")}
          >
            <SelectValue placeholder={t("condition")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t("allConditions")}</SelectItem>
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
            aria-label={t("filterByCategory")}
          >
            <SelectValue placeholder={t("category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
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
            aria-label={t("filterByDepartment")}
          >
            <SelectValue placeholder={t("department")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t("allDepartments")}</SelectItem>
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
            aria-label={t("filterByCustody")}
          >
            <SelectValue placeholder={t("custody")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t("allCustody")}</SelectItem>
              <SelectItem value="available">{t("available")}</SelectItem>
              <SelectItem value="borrowed">{t("tableBorrowed")}</SelectItem>
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
          {t("clear")}
        </Button>
      ) : null}
    </div>
  )
}
