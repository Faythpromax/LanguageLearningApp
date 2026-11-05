import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as api from '../api';
import { color } from '../constants/theme';
import { useLanguage } from '../lang';
import { clearSession } from '../session';
import type { AppDispatch, RootState } from '../store';
import { clearAuth, setUser } from '../store/authSlice';
import { styles } from '../styles';

// Màn tài khoản: thông tin user, số từ mới mỗi ngày, ngôn ngữ, đăng xuất
export default function ProfileScreen() {
  const { lang, setLang, t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((st: RootState) => st.auth);

  // Bấm − / + : lưu ngay lên server rồi cập nhật Redux
  const changePerDay = async (value: number) => {
    try {
      dispatch(setUser(await api.updateMe(value, token!)));
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    }
  };

  const logout = () => {
    clearSession();
    dispatch(clearAuth());
  };

  if (!user) {
    return null;
  }
  const perDay = user.newCardsPerDay;

  return (
    <View style={styles.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(user.name || user.email)[0].toUpperCase()}
          </Text>
        </View>
        <Text style={s.name}>{user.name}</Text>
        <Text style={styles.muted}>{user.email}</Text>
      </View>

      <View style={[styles.card, s.section]}>
        <Text style={s.label}>{t('NEW_PER_DAY')}</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[s.stepButton, perDay <= 1 && s.disabled]}
            disabled={perDay <= 1}
            onPress={() => changePerDay(perDay - 1)}
          >
            <Text style={s.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={s.stepValue}>{perDay}</Text>
          <TouchableOpacity
            style={[s.stepButton, perDay >= 50 && s.disabled]}
            disabled={perDay >= 50}
            onPress={() => changePerDay(perDay + 1)}
          >
            <Text style={s.stepText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, s.section]}>
        <Text style={s.label}>{t('LANGUAGE')}</Text>
        <View style={styles.row}>
          {(['vn', 'en'] as const).map(l => (
            <TouchableOpacity
              key={l}
              style={[s.pill, lang === l && s.pillActive]}
              onPress={() => setLang(l)}
            >
              <Text style={[s.pillText, lang === l && s.pillTextActive]}>
                {l === 'vn' ? 'Tiếng Việt' : 'English'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.buttonAccent]}
        onPress={logout}
      >
        <Text style={styles.buttonText}>{t('LOGOUT')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { color: color.white, fontSize: 30, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: color.text },
  section: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 16, color: color.text, fontWeight: '600' },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 20, color: color.primary, fontWeight: 'bold' },
  stepValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
    minWidth: 28,
    textAlign: 'center',
  },
  disabled: { opacity: 0.4 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.border,
  },
  pillActive: { backgroundColor: color.primary, borderColor: color.primary },
  pillText: { color: color.text },
  pillTextActive: { color: color.white, fontWeight: '600' },
});
