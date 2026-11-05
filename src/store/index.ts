import { configureStore } from '@reduxjs/toolkit';
import language from './languageSlice';
import auth from './authSlice';

export const store = configureStore({ reducer: { language, auth } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
