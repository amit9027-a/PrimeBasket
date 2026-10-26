import { createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "./cartAPI";
import type { AddToCartPayload } from "./cartAPI";

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const response = await cartApi.getCart();
  return response.data;
});

export const addItem = createAsyncThunk(
  "cart/addItem",
  async (data: AddToCartPayload) => {
    const response = await cartApi.addToCart(data);
    return response.data;
  },
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
    const response = await cartApi.updateQuantity(itemId, quantity);
    return response.data;
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId: number) => {
    const response = await cartApi.removeItem(itemId);
    return response.data;
  },
);

export const clearCartItems = createAsyncThunk("cart/clearCartItems", async () => {
  const response = await cartApi.clearCart();
  return response.data;
});
