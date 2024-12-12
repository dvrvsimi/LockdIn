import { FC, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  loading = false,
  children,
  className = '',
  icon,
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  // Size variations
  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-lg'
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
    ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
    destructive: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};