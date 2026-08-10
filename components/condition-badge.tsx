import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiToolsLine,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { conditionLabels } from "@/lib/asset-format"
import type { AssetCondition } from "@/lib/asset-types"
import { getLang } from "@/lib/get-lang"

export async function ConditionBadge({
  condition,
}: {
  condition: AssetCondition
}) {
  const lang = await getLang()
  const Icon =
    condition === "GOOD"
      ? RiCheckboxCircleLine
      : condition === "UNDER_REPAIR"
        ? RiToolsLine
        : RiCloseCircleLine

  return (
    <Badge
      variant={
        condition === "GOOD"
          ? "success"
          : condition === "UNDER_REPAIR"
            ? "warning"
            : "destructive"
      }
    >
      <Icon data-icon="inline-start" />
      {conditionLabels(lang)[condition]}
    </Badge>
  )
}
