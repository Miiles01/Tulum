import { useCart } from './context/CartContext';

export function useDisplayPrice(basePrice) {
  return { price: basePrice, shippingIncluded: false };
}
