import Link from "next/link"
import {
  RiArchiveLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiExchangeBoxLine,
  RiToolsLine,
} from "@remixicon/react"

import { ActivityFeed } from "@/components/activity-feed"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apiGet } from "@/lib/api"
import type { AssetCondition, DashboardData } from "@/lib/asset-types"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

const cards = [
  { key: "TOTAL", labelKey: "dashTotalAssets", icon: RiArchiveLine },
  { key: "GOOD", labelKey: "conditionGood", icon: RiCheckboxCircleLine },
  {
    key: "UNDER_REPAIR",
    labelKey: "conditionUnderRepair",
    icon: RiToolsLine,
  },
  { key: "DAMAGED", labelKey: "conditionDamaged", icon: RiCloseCircleLine },
  { key: "BORROWED", labelKey: "dashBorrowedNow", icon: RiExchangeBoxLine },
] as const

export default async function DashboardPage() {
  const lang = await getLang()
  const t = getDictionary(lang)
  const dashboard = await apiGet<DashboardData>("/dashboard")
  const conditionCounts = Object.fromEntries(
    dashboard.byCondition.map((item) => [item.condition, item._count])
  ) as Partial<Record<AssetCondition, number>>

  return (
    <>
      <PageHeader
        eyebrow={t.dashEyebrow}
        title={t.dashTitle}
        description={t.dashDescription}
        actions={
          <Link
            href="/assets"
            className={buttonVariants({ variant: "outline" })}
          >
            {t.openRegister}
            <RiArrowRightLine data-icon="inline-end" />
          </Link>
        }
      />

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
        aria-label={t.dashEyebrow}
      >
        {cards.map((card) => {
          const value =
            card.key === "TOTAL"
              ? dashboard.total
              : card.key === "BORROWED"
                ? dashboard.activeLoans
                : (conditionCounts[card.key] ?? 0)

          return (
            <Card key={card.key} size="sm">
              <CardHeader>
                <CardDescription>{t[card.labelKey]}</CardDescription>
                <CardAction>
                  <card.icon className="text-muted-foreground" />
                </CardAction>
                <CardTitle className="font-mono text-3xl tabular-nums">
                  {value}
                </CardTitle>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashConditionDistribution}</CardTitle>
            <CardDescription>{t.dashDistributionDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {(["GOOD", "UNDER_REPAIR", "DAMAGED"] as const).map((condition) => {
              const count = conditionCounts[condition] ?? 0
              const percentage = dashboard.total
                ? Math.round((count / dashboard.total) * 100)
                : 0
              return (
                <div key={condition} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      {condition === "GOOD"
                        ? t.conditionGood
                        : condition === "UNDER_REPAIR"
                          ? t.conditionUnderRepair
                          : t.conditionDamaged}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {count} / {percentage}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        condition === "DAMAGED"
                          ? "h-full bg-destructive"
                          : condition === "UNDER_REPAIR"
                            ? "h-full bg-secondary-foreground"
                            : "h-full bg-primary"
                      }
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dashActiveCustody}</CardTitle>
            <CardDescription>{t.dashActiveCustodyDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.activeLoanDetails.length ? (
              <div className="flex flex-col gap-3">
                {dashboard.activeLoanDetails.map((loan) => (
                  <Link
                    key={loan.id}
                    href={`/assets/${loan.asset?.id}`}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {loan.asset?.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {loan.borrowerDepartment.name} /{" "}
                        {loan.responsiblePerson}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {loan.destinationLocation ?? t.dashLocationNotRecorded}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center">
                <RiCheckboxCircleLine className="text-primary" />
                <p className="text-sm font-medium">{t.dashNoActiveBorrowing}</p>
                <p className="text-xs text-muted-foreground">
                  {t.dashAllInOwnerCustody}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t.dashRecentActivity}</CardTitle>
          <CardDescription>{t.dashRecentActivityDesc}</CardDescription>
          <CardAction>
            <Link
              href="/history"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {t.viewAll}
              <RiArrowRightLine data-icon="inline-end" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ActivityFeed activities={dashboard.recentActivity} />
        </CardContent>
      </Card>
    </>
  )
}
