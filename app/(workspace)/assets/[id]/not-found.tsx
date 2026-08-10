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
import { getLang } from "@/lib/get-lang"
import { getDictionary } from "@/lib/i18n"

export default async function AssetNotFound() {
  const t = getDictionary(await getLang())
  return (
    <Empty className="min-h-[60vh] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiArchiveLine />
        </EmptyMedia>
        <EmptyTitle>{t.assetNotFound}</EmptyTitle>
        <EmptyDescription>{t.assetNotFoundDesc}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/assets" className={buttonVariants()}>
          <RiArrowLeftLine data-icon="inline-start" />
          {t.backToRegister}
        </Link>
      </EmptyContent>
    </Empty>
  )
}
