import api from "../../api/axios";

export interface AddToCartPayload {
  productId: number;
  quantity: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string | null;
}

export interface CartResponse {
  id: number;
  userId: number;
  totalItems: number;
  totalAmount: number;
  items: CartItem[];
}

export const getCart = () => {
  return api.get<CartResponse>("/cart");
};

export const addToCart = (data: AddToCartPayload) => {
  return api.post<CartResponse>("/cart/items", data);
};

export const updateQuantity = (itemId: number, quantity: number) => {
  return api.put<CartResponse>(`/cart/items/${itemId}`, { quantity });
};

export const removeItem = (itemId: number) => {
  return api.delete<CartResponse>(`/cart/items/${itemId}`);
};

export const clearCart = () => {
  return api.delete<CartResponse>("/cart/clear");
};
