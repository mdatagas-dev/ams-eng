"use client"

import { RiDatabaseLine, RiRefreshLine } from "@remixicon/react"

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
  return (
    <Empty className="min-h-[60vh] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiDatabaseLine />
        </EmptyMedia>
        <EmptyTitle>Asset data is unavailable</EmptyTitle>
        <EmptyDescription>
          Check that the Express API and PostgreSQL database are running, then
          try again.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={unstable_retry}>
          <RiRefreshLine data-icon="inline-start" />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  )
}
