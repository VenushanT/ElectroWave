// src/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: null,
  totalQuantity: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      console.error('Cart Error:', action.payload); // Added for debugging
    },
    setCart: (state, action) => {
      state.cart = action.payload;
      state.totalQuantity = action.payload?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      state.error = null;
      console.log('Cart Updated:', action.payload, 'Total Quantity:', state.totalQuantity); // Added for debugging
    },
    clearCart: (state) => {
      state.cart = null;
      state.totalQuantity = 0;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, setCart, clearCart, clearError } = cartSlice.actions;

export default cartSlice.reducer;