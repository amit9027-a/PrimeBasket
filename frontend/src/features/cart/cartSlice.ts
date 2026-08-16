import { createSlice } from "@reduxjs/toolkit";
import type { CartItem } from "./cartAPI";
import { addItem, clearCartItems, fetchCart, removeCartItem, updateItemQuantity } from "./cartThunks";

const initialState = {
  items: [] as CartItem[],
  totalPrice: 0,
  totalItems: 0,
  loading: false,
  error: null as string | null,
  initialized: false,
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    const applyCartState = (
      state: typeof initialState,
      action: { payload: { items: CartItem[]; totalItems: number; totalAmount: number } },
    ) => {
      state.items = action.payload.items;
      state.totalItems = action.payload.totalItems;
      state.totalPrice = action.payload.totalAmount;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    };

    builder

      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        applyCartState(state, action);
      })

      .addCase(addItem.fulfilled, (state, action) => {
        applyCartState(state, action);
      })

      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        applyCartState(state, action);
      })

      .addCase(removeCartItem.fulfilled, (state, action) => {
        applyCartState(state, action);
      })

      .addCase(clearCartItems.fulfilled, (state, action) => {
        applyCartState(state, action);
      })

      .addMatcher((action) => action.type.startsWith("cart/") && action.type.endsWith("/pending"), (state) => {
        state.loading = true;
        state.error = null;
      })

      .addMatcher((action) => action.type.startsWith("cart/") && action.type.endsWith("/rejected"), (state, action: any) => {
        state.loading = false;
        state.initialized = true;
        state.error =
          (action.error.message as string | undefined) ||
          "Something went wrong while updating your cart.";
      });
  },
});

export default cartSlice.reducer;
