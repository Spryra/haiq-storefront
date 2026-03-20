import clsx from 'clsx'

export default function Button({ children, variant = 'primary', className, ...props }) {
  const base = 'px-4 py-2 rounded font-medium transition disabled:opacity-50'
  const variants = {
    primary: 'bg-primary text-dark hover:bg-primary/80',
    ghost: 'border border-primary text-primary hover:bg-primary/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}