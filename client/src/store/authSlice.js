import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUser: (state, action) => {
      const userData = action.payload.user || action.payload; // Handle nested or flat user data
      state.user = { ...state.user, ...userData }; // Merge existing user data with new data
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      } else {
        localStorage.removeItem('token');
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, setUser, updateUser, logout, clearError } = authSlice.actions;

export const currentUser = createSelector(
  (state) => state.auth.user,
  (user) => user
);

export default authSlice.reducer;