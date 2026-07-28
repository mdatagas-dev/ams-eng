import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Loading asset data</span>
      <div className="flex flex-col gap-2 border-b pb-6">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-4 w-[36rem] max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}
