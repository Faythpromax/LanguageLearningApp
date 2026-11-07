/**
 * LanguageLearningApp - Đăng nhập + các tab Học / Quản trị / Tài khoản
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useDispatch, useSelector } from 'react-redux';
import * as api from './src/api';
import AuthScreen from './src/screens/auth/AuthScreen';
import WordsScreen from './src/screens/user/vocabulary/WordsScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import AdminScreen from './src/screens/admin/AdminScreen';
import AdminWordsScreen from './src/screens/admin/AdminWordsScreen';
import AdminGrammarScreen from './src/screens/admin/AdminGrammarScreen';
import GrammarScreen from './src/screens/user/grammar/GrammarScreen';
import { clearSession, loadSession, saveSession } from './src/session';
import { color } from './src/constants/theme';
import { useLanguage } from './src/lang';
import { AppDispatch, RootState, store } from './src/store';
import { clearAuth, setToken, setUser } from './src/store/authSlice';
import { loadLang } from './src/store/languageSlice';
import { styles } from './src/styles';

const Tab = createBottomTabNavigator();

// Icon tab dùng emoji để không phải cài thêm thư viện icon
const tabIcon = (emoji: string) => () =>
  <Text style={styles.tabIcon}>{emoji}</Text>;
const StudyIcon = tabIcon('📖');
const AdminIcon = tabIcon('📊');
const WordsIcon = tabIcon('🗂️');
const GrammarIcon = tabIcon('📝');
const ProfileIcon = tabIcon('👤');

function Main() {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((s: RootState) => s.auth);
  const [expiresAt, setExpiresAt] = useState(0);
  const [checking, setChecking] = useState(true); // đang đọc phiên từ AsyncStorage

  const logout = useCallback(() => {
    clearSession();
    dispatch(clearAuth());
  }, [dispatch]);

  // Có token (vừa đăng nhập hoặc mở lại app): lưu vào Redux rồi tải thông tin user; token hỏng thì đăng xuất
  const startSession = useCallback(
    async (tok: string, exp: number) => {
      dispatch(setToken(tok));
      setExpiresAt(exp);
      try {
        dispatch(setUser(await api.getMe(tok)));
      } catch {
        logout();
      }
    },
    [dispatch, logout],
  );

  // Mở app: nếu còn phiên hợp lệ trong AsyncStorage thì vào thẳng, không cần đăng nhập
  useEffect(() => {
    loadSession()
      .then(s => s && startSession(s.token, s.expiresAt))
      .finally(() => setChecking(false));
  }, [startSession]);

  // Đang dùng app mà hết hạn thì tự đăng xuất, quay về màn Auth
  useEffect(() => {
    if (!token) {
      return;
    }
    const timer = setTimeout(logout, Math.max(0, expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [token, expiresAt, logout]);

  const onLoggedIn = async (tok: string) => {
    const s = await saveSession(tok);
    await startSession(s.token, s.expiresAt);
  };

  if (checking) {
    return <ActivityIndicator style={styles.container} color={color.primary} />;
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <AuthScreen onLoggedIn={onLoggedIn} />
      </SafeAreaView>
    );
  }

  // Chờ tải xong user mới biết là admin hay người học
  if (!user) {
    return <ActivityIndicator style={styles.container} color={color.primary} />;
  }

  // Đã đăng nhập: admin có Tổng quan + quản lý Từ vựng / Ngữ pháp, người học có Học + Ngữ pháp
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: color.white },
          headerTitleStyle: { color: color.text, fontWeight: 'bold' },
          headerShadowVisible: false,
          tabBarActiveTintColor: color.primary,
          tabBarInactiveTintColor: color.textMuted,
        }}
      >
        {user.role === 'admin' ? (
          <>
            <Tab.Screen
              name="Admin"
              component={AdminScreen}
              options={{ title: t('DASHBOARD'), tabBarIcon: AdminIcon }}
            />
            <Tab.Screen
              name="AdminWords"
              component={AdminWordsScreen}
              options={{ title: t('VOCABULARY'), tabBarIcon: WordsIcon }}
            />
            <Tab.Screen
              name="AdminGrammar"
              component={AdminGrammarScreen}
              options={{ title: t('GRAMMAR'), tabBarIcon: GrammarIcon }}
            />
          </>
        ) : (
          <>
            <Tab.Screen
              name="Study"
              component={WordsScreen}
              options={{ title: t('STUDY'), tabBarIcon: StudyIcon }}
            />
            <Tab.Screen
              name="Grammar"
              component={GrammarScreen}
              options={{ title: t('GRAMMAR'), tabBarIcon: GrammarIcon }}
            />
          </>
        )}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: t('PROFILE'), tabBarIcon: ProfileIcon }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

store.dispatch(loadLang());

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <Main />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
