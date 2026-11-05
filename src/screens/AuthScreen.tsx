import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as api from '../api';
import { color } from '../constants/theme';
import { useLanguage } from '../lang';
import { styles } from '../styles';

// Màn hình đăng nhập / đăng ký
export default function AuthScreen({
  onLoggedIn,
}: {
  onLoggedIn: (t: string) => void;
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const submit = async () => {
    setLoading(true);
    try {
      if (!isLogin) {
        await api.register(email, password, name);
      }
      const data = await api.login(email, password);
      onLoggedIn(data.token);
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={s.langButton}
        onPress={() => setLang(lang === 'vn' ? 'en' : 'vn')}
      >
        <Text style={s.langText}>{lang === 'vn' ? 'VN' : 'EN'}</Text>
      </TouchableOpacity>

      {/* Logo + tên app */}
      <View style={s.brand}>
        <Text style={s.appName}>{t('APP_NAME')}</Text>
        <Text style={styles.muted}>{t('APP_SLOGAN')}</Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.title}>{isLogin ? t('LOGIN') : t('REGISTER')}</Text>
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder={t('NAME')}
            placeholderTextColor={color.textMuted}
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={t('EMAIL')}
          placeholderTextColor={color.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder={t('PASSWORD')}
          placeholderTextColor={color.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '...' : isLogin ? t('LOGIN') : t('REGISTER')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.link}>
          {isLogin ? t('NO_ACCOUNT') : t('HAVE_ACCOUNT')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  langButton: {
    alignSelf: 'flex-end',
    backgroundColor: color.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  langText: { color: color.primary, fontWeight: '700' },
  brand: { alignItems: 'center', marginTop: 32, marginBottom: 28 },
  appName: { fontSize: 32, fontWeight: '800', color: color.primary },
});
