import { cn } from "@/lib/cn"
import { Card } from "@/components/ui-kit"

function Bar({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export function SkeletonTenderCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Bar className="h-4 w-24" />
        <Bar className="h-5 w-16" />
      </div>
      <Bar className="mt-4 h-5 w-full" />
      <Bar className="mt-2 h-5 w-2/3" />
      <div className="mt-5 flex items-center gap-4">
        <Bar className="h-4 w-20" />
        <Bar className="h-4 w-24" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <Bar className="h-4 w-28" />
        <Bar className="h-8 w-24" />
      </div>
    </Card>
  )
}

export function SkeletonTenderGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTenderCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <Card className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Bar className="h-4 w-1/3" />
          <Bar className="h-4 w-1/5" />
          <Bar className="ml-auto h-4 w-16" />
        </div>
      ))}
    </Card>
  )
}

export function SkeletonChart({ className }) {
  return (
    <Card className={cn("p-5", className)}>
      <Bar className="h-4 w-40" />
      <Bar className="mt-6 h-48 w-full" />
    </Card>
  )
}

export function SkeletonTenderDetails() {
  return (
    <div className="space-y-6">
      <Bar className="h-8 w-2/3" />
      <Bar className="h-4 w-1/3" />
      <div className="grid gap-4 md:grid-cols-3">
        <Bar className="h-24" />
        <Bar className="h-24" />
        <Bar className="h-24" />
      </div>
      <Bar className="h-64 w-full" />
    </div>
  )
}
