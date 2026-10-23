import { useDispatch, useSelector } from 'react-redux';
import en from './constants/en';
import vn from './constants/vn';
import type { AppDispatch, RootState } from './store';
import { changeLang, Lang } from './store/languageSlice';

const dictionaries = { en, vn };

// Màn hình dùng hook này: lấy ngôn ngữ từ Redux, t('KEY') trả về chữ tương ứng
export function useLanguage() {
  const lang = useSelector((s: RootState) => s.language.lang);
  const dispatch = useDispatch<AppDispatch>();
  return {
    lang,
    setLang: (l: Lang) => dispatch(changeLang(l)),
    t: (key: keyof typeof vn) => dictionaries[lang][key] as string,
  };
}
