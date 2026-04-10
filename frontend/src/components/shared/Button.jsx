import clsx from 'clsx';
import { Link } from 'react-router-dom';

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  as = 'button',
  to,
  ...props 
}) {
  const isFullWidth = className?.includes('w-full');
  const base = clsx(isFullWidth ? 'flex' : 'inline-flex', 'items-center justify-center font-bold uppercase tracking-wide transition-all duration-200');
  
  const variants = {
    primary: 'bg-primary text-dark hover:bg-secondary hover:opacity-90 active:scale-[0.98]',
    secondary: 'border border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:underline',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  const mergedClass = clsx(base, variants[variant], className);
  
  if (as === 'link' && to) {
    return (
      <Link to={to} className={mergedClass} {...props}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={mergedClass} {...props}>
      {children}
    </button>
  );
}