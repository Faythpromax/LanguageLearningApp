import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as api from '../../api';
import type { Word, WordInput } from '../../api';
import { color } from '../../constants/theme';
import { useLanguage } from '../../lang';
import type { RootState } from '../../store';
import { styles } from '../../styles';

const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
const EMPTY: WordInput = {
  word: '',
  phonetic: '',
  partOfSpeech: '',
  meaning: '',
  example: '',
  exampleMeaning: '',
  level: 'A1',
};

// Màn admin quản lý từ vựng: danh sách gọn + tìm kiếm, chạm 1 dòng để sửa/xóa, nút + để thêm
export default function AdminWordsScreen() {
  const { t } = useLanguage();
  const token = useSelector((st: RootState) => st.auth.token)!;
  const [words, setWords] = useState<Word[]>([]);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null); // 'new' = đang thêm từ mới
  const [form, setForm] = useState<WordInput>(EMPTY);
  const [looking, setLooking] = useState(false); // đang tra phiên âm

  const load = useCallback(async () => {
    try {
      setWords(await api.getWords(token));
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    }
  }, [token, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // shortcut: lọc ngay trên app vì đã tải hết danh sách; khi kho từ lên hàng nghìn thì chuyển sang tìm ở server
  const q = query.trim().toLowerCase();
  const shown = q
    ? words.filter(
        w =>
          w.word.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q),
      )
    : words;

  const openForm = (w?: Word) => {
    setForm(w ? { ...EMPTY, ...w } : EMPTY);
    setEditingId(w ? w._id : 'new');
  };

  // Lưu: thêm mới hoặc cập nhật rồi tải lại danh sách
  const save = async () => {
    if (!form.word.trim() || !form.meaning.trim()) {
      Alert.alert(t('ERROR'), t('REQUIRED_WORD_MEANING'));
      return;
    }
    try {
      if (editingId === 'new') {
        await api.createWord(form, token);
      } else {
        await api.updateWord(editingId!, form, token);
      }
      setEditingId(null);
      load();
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    }
  };

  // Xóa: hỏi xác nhận trước vì không hoàn tác được
  const remove = () => {
    Alert.alert(t('DELETE'), `${t('CONFIRM_DELETE')} "${form.word}"?`, [
      { text: t('CANCEL'), style: 'cancel' },
      {
        text: t('DELETE'),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteWord(editingId!, token);
            setEditingId(null);
            load();
          } catch (e: any) {
            Alert.alert(t('ERROR'), e.message);
          }
        },
      },
    ]);
  };

  // Tự điền phiên âm theo từ đang nhập; không tìm thấy thì báo để admin tự nhập
  const fillPhonetic = async () => {
    const word = form.word.trim();
    if (!word) {
      Alert.alert(t('ERROR'), t('ENTER_WORD_FIRST'));
      return;
    }
    setLooking(true);
    try {
      const phonetic = await api.lookupPhonetic(word);
      if (phonetic) {
        setForm(f => ({ ...f, phonetic }));
      } else {
        Alert.alert(t('PHONETIC_NOT_FOUND'));
      }
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    } finally {
      setLooking(false);
    }
  };

  const field = (key: keyof WordInput, label: string) => (
    <TextInput
      style={[styles.input, styles.formInput]}
      placeholder={label}
      placeholderTextColor={color.textMuted}
      value={(form[key] as string) ?? ''}
      onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
    />
  );

  return (
    <View style={styles.container}>
      {/* Ô tìm kiếm + nút thêm */}
      <View style={[styles.row, styles.searchRow]}>
        <TextInput
          style={[styles.input, styles.search]}
          placeholder={t('SEARCH')}
          placeholderTextColor={color.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={[styles.button, styles.buttonAccent, styles.addButton]}
          onPress={() => openForm()}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.muted, styles.count]}>
        {shown.length} / {words.length}
      </Text>

      {/* Danh sách gọn: mỗi từ 1 dòng */}
      <FlatList
        data={shown}
        keyExtractor={w => w._id}
        ItemSeparatorComponent={Separator}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => openForm(item)}
          >
            <View style={styles.flex1}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {item.word}
                {!!item.phonetic && (
                  <Text style={styles.muted}> {item.phonetic}</Text>
                )}
              </Text>
              <Text style={styles.muted} numberOfLines={1}>
                {item.meaning}
              </Text>
            </View>
            <Text style={styles.levelBadge}>{item.level}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.muted, styles.empty]}>{t('NO_WORDS')}</Text>
        }
      />

      {/* Form thêm / sửa từ */}
      <Modal
        transparent
        visible={editingId !== null}
        animationType="fade"
        onRequestClose={() => setEditingId(null)}
      >
        <View style={styles.overlay}>
          <ScrollView
            style={[styles.card, styles.dialog]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.dialogTitle}>
              {editingId === 'new' ? t('ADD_WORD') : t('EDIT_WORD')}
            </Text>
            {field('word', `${t('WORD')} *`)}
            <View style={[styles.row, s.phoneticRow]}>
              <View style={styles.flex1}>
                {field('phonetic', t('PHONETIC'))}
              </View>
              <TouchableOpacity
                style={[s.fillButton, looking && styles.disabled]}
                disabled={looking}
                onPress={fillPhonetic}
              >
                <Text style={s.fillText}>
                  {looking ? '...' : t('AUTO_FILL')}
                </Text>
              </TouchableOpacity>
            </View>
            {field('partOfSpeech', t('PART_OF_SPEECH'))}
            {field('meaning', `${t('MEANING')} *`)}
            {field('example', t('EXAMPLE'))}
            {field('exampleMeaning', t('EXAMPLE_MEANING'))}

            <View style={[styles.row, styles.levelRow]}>
              {LEVELS.map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.pill, form.level === l && styles.pillActive]}
                  onPress={() => setForm(f => ({ ...f, level: l }))}
                >
                  <Text
                    style={
                      form.level === l ? styles.pillTextActive : styles.pillText
                    }
                  >
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSoft, styles.flex1]}
                onPress={() => setEditingId(null)}
              >
                <Text style={styles.buttonSoftText}>{t('CANCEL')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.flex1]}
                onPress={save}
              >
                <Text style={styles.buttonText}>{t('SAVE')}</Text>
              </TouchableOpacity>
            </View>
            {editingId !== 'new' && (
              <TouchableOpacity onPress={remove}>
                <Text style={styles.deleteText}>{t('DELETE')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const Separator = () => <View style={styles.separator} />;

const s = StyleSheet.create({
  phoneticRow: { gap: 8, alignItems: 'flex-start' },
  fillButton: {
    backgroundColor: color.accentLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fillText: { color: color.accent, fontWeight: '700' },
});
