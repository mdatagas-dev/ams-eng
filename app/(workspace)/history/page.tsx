import { ActivityFeed } from "@/components/activity-feed"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiGet } from "@/lib/api"
import type { Activity } from "@/lib/asset-types"
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

export default async function HistoryPage() {
  const lang = await getLang()
  const t = getDictionary(lang)
  const activities = await apiGet<Activity[]>("/activities")

  return (
    <>
      <PageHeader
        eyebrow={t.historyEyebrow}
        title={t.historyTitle}
        description={t.historyDescription}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t.latest100}</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed activities={activities} />
        </CardContent>
      </Card>
    </>
  )
}
