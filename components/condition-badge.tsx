import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiToolsLine,
} from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { conditionLabels } from "@/lib/asset-format"
import type { AssetCondition } from "@/lib/asset-types"

export function ConditionBadge({ condition }: { condition: AssetCondition }) {
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
      {conditionLabels[condition]}
    </Badge>
  )
}
