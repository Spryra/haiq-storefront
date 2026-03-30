import clsx from 'clsx';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-bold uppercase tracking-wide transition-all duration-200';
  const variants = {
    primary: 'bg-primary text-dark hover:bg-secondary active:scale-[0.98]',
    secondary: 'border border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:underline',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}