import type { FC, InputHTMLAttributes } from 'react';
import { FiSearch } from 'react-icons/fi';
import { cn } from '../../utils/helpers';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  fullWidth?: boolean;
}

const SearchBar: FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  fullWidth = false,
  className,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onSearch?.(e.target.value);
  };

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      <FiSearch className="text-text-gray absolute top-1/2 left-4 -translate-y-1/2 text-lg" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
        className={cn(
          'border-border w-full rounded-md border bg-white py-3 pr-4 pl-12 text-base',
          'focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none',
          'placeholder:text-text-light transition-all duration-200',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default SearchBar;
