import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

export interface User {
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  user_role: 'trader' | 'admin';
  user_status: 'rejected' | 'pending' | 'approved';
  jti: string;
  token: string;
}

interface UserState {
  user: User | null;
}

const getUserFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

const initialState: UserState = {
  user: getUserFromLocalStorage(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      console.log('userSlice action.payload:', action.payload);
      const { user, token } = action.payload;

      const userWithToken = {
        ...user,
        token: token,
      };

      // Update Redux state
      state.user = userWithToken;
      console.log('userSlice user with token:', userWithToken);

      // Store everything in one place
      localStorage.setItem('user', JSON.stringify(userWithToken));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    },
  },
});

export const { loginUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
