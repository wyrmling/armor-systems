import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  const baseClasses = 'w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-text-accent/50 focus:border-text-accent';
  
  if (label) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-secondary font-medium">
          {label}
        </label>
        <input
          className={`${baseClasses} ${className}`}
          {...props}
        />
      </div>
    );
  }
  
  return (
    <input
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
}