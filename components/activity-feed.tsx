import Link from "next/link"
import {
  RiArchiveLine,
  RiExchangeBoxLine,
  RiHistoryLine,
  RiToolsLine,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { activityLabels, formatDateTime } from "@/lib/asset-format"
import type { Activity } from "@/lib/asset-types"

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (!activities.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <RiHistoryLine />
          </EmptyMedia>
          <EmptyTitle>No activity recorded</EmptyTitle>
          <EmptyDescription>
            Changes to assets will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ol className="flex flex-col">
      {activities.map((activity, index) => {
        const Icon =
          activity.type === "CONDITION_CHANGED"
            ? RiToolsLine
            : activity.type === "BORROWED" || activity.type === "RETURNED"
              ? RiExchangeBoxLine
              : RiArchiveLine

        return (
          <li key={activity.id} className="relative flex gap-4 pb-5 last:pb-0">
            {index < activities.length - 1 ? (
              <span className="absolute top-8 bottom-0 left-3.5 w-px bg-border" />
            ) : null}
            <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground">
              <Icon />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{activityLabels[activity.type]}</Badge>
                <time
                  dateTime={activity.createdAt}
                  className="font-mono text-[0.6875rem] text-muted-foreground"
                >
                  {formatDateTime(activity.createdAt)}
                </time>
              </div>
              <p className="mt-1.5 text-sm font-medium">
                {activity.asset ? (
                  <Link
                    href={`/assets/${activity.asset.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {activity.summary}
                  </Link>
                ) : (
                  activity.summary
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                by {activity.actorName}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
