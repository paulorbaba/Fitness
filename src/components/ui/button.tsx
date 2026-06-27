interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'font-medium rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-[var(--color-action)] text-white',
    secondary: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]',
    ghost: 'text-[var(--color-action)]',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
