/**
 * LanguageLearningApp - man hinh co ban: Login/Register + Tu vung
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AuthScreen from './src/screens/AuthScreen';
import WordsScreen from './src/screens/WordsScreen';
import { clearSession, loadSession, saveSession } from './src/session';
import { color } from './src/constants/theme';
import { Provider } from 'react-redux';
import { useLanguage } from './src/lang';
import { store } from './src/store';
import { loadLang } from './src/store/languageSlice';
import { styles } from './src/styles';

function Main() {
  const { lang, setLang } = useLanguage();
  // Có token = đã đăng nhập. expiresAt = lúc phiên hết hạn (ms).
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [checking, setChecking] = useState(true); // đang đọc phiên từ AsyncStorage

  // Mở app: nếu còn phiên hợp lệ trong AsyncStorage thì vào thẳng, không cần đăng nhập
  useEffect(() => {
    const check = async () => {
      try {
        const s = await loadSession();
        if (s) {
          setToken(s.token);
          setExpiresAt(s.expiresAt);
        }
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  // Đang dùng app mà hết hạn thì tự đăng xuất, quay về màn Auth
  const logout = useCallback(() => {
    clearSession();
    setToken(null);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    const timer = setTimeout(logout, Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [token, expiresAt, logout]);

  const onLoggedIn = async (t: string) => {
    const s = await saveSession(t);
    setToken(s.token);
    setExpiresAt(s.expiresAt);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={color.white} />
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => setLang(lang === 'vn' ? 'en' : 'vn')}>
          <Text style={styles.link}>{lang === 'vn' ? 'EN' : 'VN'}</Text>
        </TouchableOpacity>
        {checking ? (
          <ActivityIndicator style={styles.container} />
        ) : token ? (
          <WordsScreen token={token} onLogout={logout} />
        ) : (
          <AuthScreen onLoggedIn={onLoggedIn} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

store.dispatch(loadLang());

function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}

export default App;
