import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';

interface ProductsStore {
  likedProducts: Product[];
  cartItems: Product[];
  addLikedProduct: (product: Product) => void;
  removeLikedProduct: (productId: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
}

export const useProducts = create<ProductsStore>()(
  persist(
    (set: (partial: ProductsStore | Partial<ProductsStore> | ((state: ProductsStore) => ProductsStore | Partial<ProductsStore>), replace?: boolean) => void) => ({
      likedProducts: [] as Product[],
      cartItems: [] as Product[],
      addLikedProduct: (product: Product) =>
        set((state: ProductsStore) => ({
          likedProducts: [...state.likedProducts, product],
        })),
      removeLikedProduct: (productId: string) =>
        set((state: ProductsStore) => ({
          likedProducts: state.likedProducts.filter((p: Product) => p.id !== productId),
        })),
      addToCart: (product: Product) =>
        set((state: ProductsStore) => ({
          cartItems: [...state.cartItems, product],
        })),
      removeFromCart: (productId: string) =>
        set((state: ProductsStore) => ({
          cartItems: state.cartItems.filter((p: Product) => p.id !== productId),
        })),
    }),
    {
      name: 'products-storage',
    }
  )
);