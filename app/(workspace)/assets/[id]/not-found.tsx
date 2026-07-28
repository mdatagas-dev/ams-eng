import Link from "next/link"
import { RiArchiveLine, RiArrowLeftLine } from "@remixicon/react"

import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function AssetNotFound() {
  return (
    <Empty className="min-h-[60vh] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiArchiveLine />
        </EmptyMedia>
        <EmptyTitle>Asset not found</EmptyTitle>
        <EmptyDescription>
          This asset does not exist or is no longer available in the register.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/assets" className={buttonVariants()}>
          <RiArrowLeftLine data-icon="inline-start" />
          Back to register
        </Link>
      </EmptyContent>
    </Empty>
  )
}
