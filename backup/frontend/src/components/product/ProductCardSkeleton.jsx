export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-light rounded-2xl overflow-hidden shadow-sm">

      {/* Image — same aspect-square as real card */}
      <div className="relative w-full aspect-square bg-gray-200 skeleton flex-shrink-0" />

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1 mb-3 space-y-2">
          <div className="h-4 bg-gray-200 skeleton rounded w-4/5" />
          <div className="h-3 bg-gray-200 skeleton rounded w-1/2" />
          <div className="h-4 bg-gray-200 skeleton rounded w-1/3" />
          <div className="h-3 bg-gray-200 skeleton rounded w-full mt-2" />
          <div className="h-3 bg-gray-200 skeleton rounded w-3/4" />
        </div>
        <div className="mt-auto h-10 bg-gray-200 skeleton rounded-xl" />
      </div>
    </div>
  )
}
