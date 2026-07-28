import { ActivityFeed } from "@/components/activity-feed"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet } from "@/lib/api"
import type { Activity } from "@/lib/asset-types"

export default async function HistoryPage() {
  const activities = await apiGet<Activity[]>("/activities")

  return (
    <>
      <PageHeader
        eyebrow="Audit trail"
        title="Activity history"
        description="Chronological asset registration, data changes, condition transitions, loans, and returns."
      />
      <Card>
        <CardHeader>
          <CardTitle>Latest 100 events</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed activities={activities} />
        </CardContent>
      </Card>
    </>
  )
}
