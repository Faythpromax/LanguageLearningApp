import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Lang = 'vn' | 'en';

const KEY = 'lang';

const languageSlice = createSlice({
  name: 'language',
  initialState: { lang: 'vn' as Lang },
  reducers: {
    setLang: (state, action: PayloadAction<Lang>) => {
      state.lang = action.payload;
    },
  },
});

export const { setLang } = languageSlice.actions;
export default languageSlice.reducer;

// Đổi ngôn ngữ trong Redux và lưu vào AsyncStorage để lần mở app sau còn nhớ
export const changeLang = createAsyncThunk(
  'language/change',
  async (lang: Lang, { dispatch }) => {
    dispatch(setLang(lang));
    await AsyncStorage.setItem(KEY, lang);
  },
);

// Mở app: đọc ngôn ngữ đã lưu (nếu có) vào Redux
export const loadLang = createAsyncThunk(
  'language/load',
  async (_: void, { dispatch }) => {
    const saved = await AsyncStorage.getItem(KEY);
    if (saved === 'vn' || saved === 'en') {
      dispatch(setLang(saved));
    }
  },
);
