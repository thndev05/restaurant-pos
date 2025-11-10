import type { InputHTMLAttributes, FC, ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input: FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={cn('flex flex-col gap-2', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-text-dark text-sm font-semibold">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="text-text-gray absolute top-1/2 left-4 -translate-y-1/2">{leftIcon}</div>
        )}
        <input
          id={inputId}
          className={cn(
            'border-border w-full rounded-md border-2 px-4 py-3 text-base transition-all duration-200',
            'focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none',
            'placeholder:text-text-light',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            leftIcon ? 'pl-12' : '',
            rightIcon ? 'pr-12' : '',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="text-text-gray absolute top-1/2 right-4 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="text-danger text-sm">{error}</span>}
    </div>
  );
};

export default Input;
