export function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl border-4 border-gray-200 p-4"
      style={{
        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
        boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.05), 4px 4px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar skeleton */}
        <div className="h-14 w-14 rounded-full bg-gray-300" />

        {/* Info skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-full bg-gray-300" />
          <div className="h-3 w-1/2 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* Buttons skeleton */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="h-10 rounded-xl bg-gray-300" />
        <div className="h-10 rounded-xl bg-gray-300" />
        <div className="h-10 rounded-xl bg-gray-300" />
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
