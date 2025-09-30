import {createSlice} from '@reduxjs/toolkit';
import {toast} from 'react-toastify';

interface User {
  email: string;
  first_name: string;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: { email: 'test@test.com', first_name: 'Test' },
};

const userSlice = createSlice({
  name:'user',initialState,reducers:{
    loginUser:(state, action) => {
      console.log('login');
    },
    logoutUser:(state) => {
      state.user = null;
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    },
  }
});

export const {loginUser, logoutUser} = userSlice.actions;
export default userSlice.reducer;