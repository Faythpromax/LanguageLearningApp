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
import type { Grammar, GrammarInput } from '../../api';
import { color } from '../../constants/theme';
import { useLanguage } from '../../lang';
import type { RootState } from '../../store';
import { styles } from '../../styles';

const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;

// Form lưu dạng chữ: usage mỗi dòng 1 cách dùng, examples mỗi dòng "câu tiếng Anh | nghĩa"
type Form = {
  title: string;
  structure: string;
  usage: string;
  examples: string;
  notes: string;
  level: (typeof LEVELS)[number];
  order: string;
};
const EMPTY: Form = {
  title: '',
  structure: '',
  usage: '',
  examples: '',
  notes: '',
  level: 'A1',
  order: '',
};

// Chuyển qua lại giữa bài ngữ pháp và form dạng chữ
export const toForm = (g: Grammar): Form => ({
  title: g.title,
  structure: g.structure ?? '',
  usage: g.usage.join('\n'),
  examples: g.examples.map(e => `${e.en} | ${e.vi}`).join('\n'),
  notes: g.notes ?? '',
  level: g.level ?? 'A1',
  order: String(g.order ?? ''),
});
const lines = (text: string) =>
  text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
export const fromForm = (f: Form): GrammarInput => ({
  title: f.title.trim(),
  structure: f.structure.trim(),
  usage: lines(f.usage),
  examples: lines(f.examples).map(l => {
    const [en, ...vi] = l.split('|');
    return { en: en.trim(), vi: vi.join('|').trim() };
  }),
  notes: f.notes.trim(),
  level: f.level,
  order: Number(f.order) || 0,
});

// Màn admin quản lý ngữ pháp: danh sách gọn + tìm kiếm, chạm 1 dòng để sửa/xóa, nút + để thêm
export default function AdminGrammarScreen() {
  const { t } = useLanguage();
  const token = useSelector((st: RootState) => st.auth.token)!;
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null); // 'new' = đang thêm bài mới
  const [form, setForm] = useState<Form>(EMPTY);

  const load = useCallback(async () => {
    try {
      setGrammars(await api.getGrammars(token));
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    }
  }, [token, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const q = query.trim().toLowerCase();
  const shown = q
    ? grammars.filter(
        g =>
          g.title.toLowerCase().includes(q) ||
          (g.structure ?? '').toLowerCase().includes(q),
      )
    : grammars;

  // Bài mới mặc định nằm cuối danh sách
  const openForm = (g?: Grammar) => {
    setForm(g ? toForm(g) : { ...EMPTY, order: String(grammars.length + 1) });
    setEditingId(g ? g._id : 'new');
  };

  // Lưu: thêm mới hoặc cập nhật rồi tải lại danh sách
  const save = async () => {
    if (!form.title.trim()) {
      Alert.alert(t('ERROR'), t('REQUIRED_TITLE'));
      return;
    }
    try {
      if (editingId === 'new') {
        await api.createGrammar(fromForm(form), token);
      } else {
        await api.updateGrammar(editingId!, fromForm(form), token);
      }
      setEditingId(null);
      load();
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    }
  };

  // Xóa: hỏi xác nhận trước vì không hoàn tác được
  const remove = () => {
    Alert.alert(t('DELETE'), `${t('CONFIRM_DELETE')} "${form.title}"?`, [
      { text: t('CANCEL'), style: 'cancel' },
      {
        text: t('DELETE'),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteGrammar(editingId!, token);
            setEditingId(null);
            load();
          } catch (e: any) {
            Alert.alert(t('ERROR'), e.message);
          }
        },
      },
    ]);
  };

  const field = (key: keyof Form, label: string, multiline = false) => (
    <TextInput
      style={[styles.input, styles.formInput, multiline && s.multiline]}
      placeholder={label}
      placeholderTextColor={color.textMuted}
      multiline={multiline}
      keyboardType={key === 'order' ? 'number-pad' : 'default'}
      value={form[key]}
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
        {shown.length} / {grammars.length}
      </Text>

      {/* Danh sách gọn: thứ tự, tên bài, công thức */}
      <FlatList
        data={shown}
        keyExtractor={g => g._id}
        ItemSeparatorComponent={Separator}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => openForm(item)}
          >
            <Text style={s.order}>{item.order}</Text>
            <View style={styles.flex1}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {!!item.structure && (
                <Text style={styles.muted} numberOfLines={1}>
                  {item.structure}
                </Text>
              )}
            </View>
            <Text style={styles.levelBadge}>{item.level}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.muted, styles.empty]}>{t('NO_GRAMMARS')}</Text>
        }
      />

      {/* Form thêm / sửa bài ngữ pháp */}
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
              {editingId === 'new' ? t('ADD_GRAMMAR') : t('EDIT_GRAMMAR')}
            </Text>
            {field('title', `${t('GRAMMAR_TITLE')} *`)}
            {field('structure', t('STRUCTURE'))}
            {field('usage', t('USAGE_HINT'), true)}
            {field('examples', t('EXAMPLES_HINT'), true)}
            {field('notes', t('NOTES'), true)}
            {field('order', t('ORDER'))}

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
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  order: { width: 24, color: color.textMuted, fontWeight: '600' },
});
