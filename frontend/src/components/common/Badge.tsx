import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md', className }) => {
  const variantStyles = {
    success: 'bg-success-light text-success-dark',
    danger: 'bg-danger-light text-danger-dark',
    warning: 'bg-warning-light text-warning-dark',
    info: 'bg-info-light text-info-dark',
    neutral: 'bg-gray-100 text-text-gray',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
