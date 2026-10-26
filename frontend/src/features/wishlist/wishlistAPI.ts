
import api from "@/api/axios";

export interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  savedAt: string;
}

export const getWishlist = async (): Promise<WishlistItem[]> => {
  const response = await api.get<WishlistItem[]>("/wishlist");
  return response.data;
};

export const addToWishlist = async (
  productId: number
): Promise<void> => {
  await api.post(`/wishlist/${productId}`);
};

export const removeFromWishlist = async (
  productId: number
): Promise<void> => {
  await api.delete(`/wishlist/${productId}`);
};