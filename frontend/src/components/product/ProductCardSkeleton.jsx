export default function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: '#1A0A00', border: '1px solid rgba(166,124,82,0.12)' }}
    >
      {/* Image — same aspect-square as real card */}
      <div className="relative w-full aspect-square skeleton flex-shrink-0" style={{ background: 'rgba(166,124,82,0.06)' }} />

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1 mb-3 space-y-2">
          <div className="h-4 skeleton rounded w-4/5" style={{ background: 'rgba(166,124,82,0.08)' }} />
          <div className="h-3 skeleton rounded w-1/2" style={{ background: 'rgba(166,124,82,0.08)' }} />
          <div className="h-4 skeleton rounded w-1/3" style={{ background: 'rgba(166,124,82,0.08)' }} />
          <div className="h-3 skeleton rounded w-full mt-2" style={{ background: 'rgba(166,124,82,0.08)' }} />
          <div className="h-3 skeleton rounded w-3/4" style={{ background: 'rgba(166,124,82,0.08)' }} />
        </div>
        <div className="mt-auto h-10 skeleton rounded-xl" style={{ background: 'rgba(166,124,82,0.08)' }} />
      </div>
    </div>
  )
}
