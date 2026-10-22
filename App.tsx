/**
 * LanguageLearningApp - man hinh co ban: Login/Register + Tu vung
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as api from './src/api';

type Word = { _id: string; word: string; meaning: string };

function App() {
  // Token giữ trong state (trong bộ nhớ). Có token = đã đăng nhập.
  const [token, setToken] = useState<string | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safe}>
        {token ? (
          <WordsScreen token={token} onLogout={() => setToken(null)} />
        ) : (
          <AuthScreen onLoggedIn={setToken} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Màn hình đăng nhập / đăng ký
function AuthScreen({ onLoggedIn }: { onLoggedIn: (t: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      if (!isLogin) {
        await api.register(email, password, name);
      }
      const data = await api.login(email, password);
      onLoggedIn(data.token);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Tên"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={submit}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? '...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.link}>
          {isLogin
            ? 'Chưa có tài khoản? Đăng ký'
            : 'Đã có tài khoản? Đăng nhập'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Màn hình từ vựng
function WordsScreen({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [words, setWords] = useState<Word[]>([]);
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.getWords(token);
      setWords(data);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!word || !meaning) {
      return;
    }
    try {
      await api.createWord({ word, meaning }, token);
      setWord('');
      setMeaning('');
      load();
    } catch (e: any) {
      Alert.alert('Loi', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Từ vựng</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.link}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="Từ"
          value={word}
          onChangeText={setWord}
        />
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="Nghĩa"
          value={meaning}
          onChangeText={setMeaning}
        />
        <TouchableOpacity style={styles.addButton} onPress={add}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={words}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.wordText}>{item.word}</Text>
            <Text style={styles.meaningText}>{item.meaning}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có từ nào</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#111',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 16, fontSize: 15 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  flex1: { flex: 1 },
  addButton: {
    backgroundColor: '#2563eb',
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  wordText: { fontSize: 18, fontWeight: '600', color: '#111' },
  meaningText: { fontSize: 15, color: '#555', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default App;
