import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'rounded-lg border transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-text-accent/50';
  
  const variantClasses = {
    primary: 'bg-surface border-border text-text-primary hover:bg-border hover:transform hover:-translate-y-0.5 hover:shadow-lg',
    secondary: 'bg-transparent border-border text-text-secondary hover:text-text-primary hover:border-text-accent'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}