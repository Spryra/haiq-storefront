const CONFIGS = {
  // Order statuses
  pending:         { label: 'Pending',         cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  freshly_kneaded: { label: 'Freshly Kneaded', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ovenbound:       { label: 'Oven Bound',      cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  on_the_cart:     { label: 'On the Cart',     cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  en_route:        { label: 'En Route',        cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  delivered:       { label: 'Delivered',       cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelled:       { label: 'Cancelled',       cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  // Payment statuses
  paid:            { label: 'Paid',            cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  unpaid:          { label: 'Unpaid',          cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  failed:          { label: 'Failed',          cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  refunded:        { label: 'Refunded',        cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  initiated:       { label: 'Initiated',       cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  successful:      { label: 'Successful',      cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIGS[status] ?? { label: status, cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}
