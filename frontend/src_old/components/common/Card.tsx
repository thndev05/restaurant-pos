import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: FC<CardProps> = ({ children, className, onClick, hover = false }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg bg-white p-4 shadow-sm',
        hover && 'cursor-pointer hover:-translate-y-1 hover:shadow-md',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
