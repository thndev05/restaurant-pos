import type { FC } from 'react';
import { cn } from '../../utils/helpers';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200',
            'flex items-center gap-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md',
            activeCategory === category.id
              ? 'bg-primary text-white'
              : 'text-text-gray hover:text-text-dark bg-white'
          )}
        >
          {category.icon && <span>{category.icon}</span>}
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
