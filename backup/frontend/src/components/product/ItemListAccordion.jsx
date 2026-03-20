import { useState } from 'react'

export default function ItemListAccordion({ items }) {
  const [open, setOpen] = useState(false)

  if (!items || items.length === 0) return null

  return (
    <div className="border rounded mb-4">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-4 py-3 font-medium flex justify-between items-center">
        What's in the box
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ul className="px-4 pb-3 list-disc list-inside">
          {items.map((item, idx) => <li key={idx}>{item.label}</li>)}
        </ul>
      )}
    </div>
  )
}