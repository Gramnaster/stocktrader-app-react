import { configureStore } from '@reduxjs/toolkit';

import userReducer from './features/user/userSlice';

export type RootState = ReturnType<typeof store.getState>;

export const store = configureStore({
  reducer: {
    userState: userReducer,
  },
});
