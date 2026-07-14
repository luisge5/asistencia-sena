export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-slate-200" />
          <div className="h-2.5 w-1/2 rounded bg-slate-200" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="h-8 rounded-md bg-slate-200" />
        <div className="h-8 rounded-md bg-slate-200" />
        <div className="h-8 rounded-md bg-slate-200" />
      </div>
    </div>
  )
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
