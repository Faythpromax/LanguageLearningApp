import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../api';

// Phiên đăng nhập: token để gọi API, user để biết tên, quyền admin, số từ mới/ngày
const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null as string | null, user: null as User | null },
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearAuth: state => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setToken, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
