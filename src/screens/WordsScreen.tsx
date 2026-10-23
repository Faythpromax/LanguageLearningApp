import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as api from '../api';
import { useLanguage } from '../lang';
import { styles } from '../styles';
import { color } from '../constants/theme';

type Word = { _id: string; word: string; meaning: string };

// Màn hình từ vựng
export default function WordsScreen({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [words, setWords] = useState<Word[]>([]);
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const { t } = useLanguage();

  const load = useCallback(async () => {
    try {
      const data = await api.getWords(token);
      setWords(data);
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
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
      Alert.alert(t('ERROR'), e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('VOCABULARY')}</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.link}>{t('LOGOUT')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder={t('WORD')}
          placeholderTextColor={color.gray500}
          value={word}
          onChangeText={setWord}
        />
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder={t('MEANING')}
          placeholderTextColor={color.gray500}
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
        ListEmptyComponent={<Text style={styles.empty}>{t('NO_WORDS')}</Text>}
      />
    </View>
  );
}
