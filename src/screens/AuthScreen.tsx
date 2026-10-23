import React, { useState } from 'react';
import {
  Alert,
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
  const { t } = useLanguage();

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
      <Text style={styles.title}>{isLogin ? t('LOGIN') : t('REGISTER')}</Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder={t('NAME')}
          placeholderTextColor={color.gray500}
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder={t('EMAIL')}
        placeholderTextColor={color.gray500}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t('PASSWORD')}
        placeholderTextColor={color.gray500}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={submit}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? '...' : isLogin ? t('LOGIN') : t('REGISTER')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.link}>
          {isLogin ? t('NO_ACCOUNT') : t('HAVE_ACCOUNT')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
