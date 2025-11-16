import type { FC } from 'react';
import type { Product } from '../../types';
import { Card } from '../common';
import { formatCurrency } from '../../utils/currency';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <Card hover onClick={() => onClick(product)} className="cursor-pointer text-center">
      <img
        src={product.image}
        alt={product.name}
        className="mx-auto mb-3 h-30 w-30 rounded-full object-cover"
      />
      <h3 className="text-text-dark mb-1 text-sm font-semibold">{product.name}</h3>
      <p className="text-text-gray text-sm">{formatCurrency(product.price)}</p>
    </Card>
  );
};

export default ProductCard;
