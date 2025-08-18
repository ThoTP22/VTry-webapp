import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for saving cart to localStorage
export const saveCartToStorage = createAsyncThunk(
  'cart/saveToStorage',
  async (cartData) => {
    console.log('🛒 saveCartToStorage - Saving data:', cartData);
    localStorage.setItem('cart', JSON.stringify(cartData));
    return cartData;
  }
);

// Async thunk for loading cart from localStorage
export const loadCartFromStorage = createAsyncThunk(
  'cart/loadFromStorage',
  async () => {
    const cartData = localStorage.getItem('cart');
    const parsedData = cartData ? JSON.parse(cartData) : { items: [], total: 0, itemCount: 0 };
    console.log('🛒 loadCartFromStorage - Loaded data:', parsedData);
    return parsedData;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    itemCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      console.log('🛒 cartSlice - addToCart called:', { product, quantity, currentItems: state.items.length });
      
      // Check if product already exists with same size and color
      const existingItem = state.items.find(item => 
        item._id === product._id && 
        item.selectedSize === product.selectedSize && 
        item.selectedColor === product.selectedColor
      );
      
      if (existingItem) {
        // Check stock limit
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock && newQuantity > product.stock) {
          console.log('🛒 cartSlice - Stock limit exceeded, setting to max stock');
          existingItem.quantity = product.stock;
        } else {
          existingItem.quantity = newQuantity;
        }
        console.log('🛒 cartSlice - Updated existing item quantity:', existingItem.quantity);
      } else {
        state.items.push({
          ...product,
          quantity,
          addedAt: new Date().toISOString(),
        });
        console.log('🛒 cartSlice - Added new item to cart');
      }
      
      // Update totals
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      console.log('🛒 cartSlice - Updated totals:', { itemCount: state.itemCount, total: state.total });
      
      // Save to localStorage after state update
      const cartData = { items: state.items, total: state.total, itemCount: state.itemCount };
      localStorage.setItem('cart', JSON.stringify(cartData));
      console.log('🛒 cartSlice - Saved to localStorage:', cartData);
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
      
      // Update totals
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Save to localStorage after state update
      const cartData = { items: state.items, total: state.total, itemCount: state.itemCount };
      localStorage.setItem('cart', JSON.stringify(cartData));
      console.log('🛒 cartSlice - Saved to localStorage after removal:', cartData);
    },

    // Update item quantity
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item._id === productId);
      
      if (item) {
        // Check stock limit
        if (item.stock && quantity > item.stock) {
          console.log('🛒 cartSlice - Stock limit exceeded, setting to max stock');
          item.quantity = item.stock;
        } else if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(item => item._id !== productId);
        } else {
          item.quantity = quantity;
        }
        
        // Update totals
        state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
        state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Save to localStorage after state update
        const cartData = { items: state.items, total: state.total, itemCount: state.itemCount };
        localStorage.setItem('cart', JSON.stringify(cartData));
        console.log('🛒 cartSlice - Saved to localStorage after quantity update:', cartData);
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      
      // Save to localStorage after state update
      const cartData = { items: [], total: 0, itemCount: 0 };
      localStorage.setItem('cart', JSON.stringify(cartData));
      console.log('🛒 cartSlice - Saved to localStorage after clear:', cartData);
    },

    // Move item to wishlist (remove from cart)
    moveToWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
      
      // Update totals
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Save to localStorage after state update
      const cartData = { items: state.items, total: state.total, itemCount: state.itemCount };
      localStorage.setItem('cart', JSON.stringify(cartData));
      console.log('🛒 cartSlice - Saved to localStorage after move to wishlist:', cartData);
    },

    // Apply discount
    applyDiscount: (state, action) => {
      const { discountType, discountValue } = action.payload;
      
      if (discountType === 'percentage') {
        state.total = state.total * (1 - discountValue / 100);
      } else if (discountType === 'fixed') {
        state.total = Math.max(0, state.total - discountValue);
      }
    },

    // Remove discount
    removeDiscount: (state) => {
      // Recalculate total without discount
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveCartToStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveCartToStorage.fulfilled, (state) => {
        state.loading = false;
        // Don't update state here to avoid infinite loop
      })
      .addCase(saveCartToStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(loadCartFromStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCartFromStorage.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(loadCartFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  moveToWishlist,
  applyDiscount,
  removeDiscount,
} = cartSlice.actions;

// Export selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

// Export reducer
export default cartSlice.reducer;
