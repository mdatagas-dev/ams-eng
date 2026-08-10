"use client"

import { RiDatabaseLine, RiRefreshLine } from "@remixicon/react"

import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function WorkspaceError({
  unstable_retry,
}: {
  unstable_retry: () => void
}) {
  const { t } = useI18n()
  return (
    <Empty className="min-h-[60vh] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiDatabaseLine />
        </EmptyMedia>
        <EmptyTitle>{t("errorTitle")}</EmptyTitle>
        <EmptyDescription>{t("errorDescription")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={unstable_retry}>
          <RiRefreshLine data-icon="inline-start" />
          {t("tryAgain")}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
