import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as api from '../../../api';
import type { Grammar } from '../../../api';
import { color } from '../../../constants/theme';
import { useLanguage } from '../../../lang';
import type { RootState } from '../../../store';
import { styles } from '../../../styles';

// Màn ngữ pháp của người học: danh sách gọn + tìm kiếm, chạm 1 bài để xem dạng thẻ (chỉ xem, không chấm điểm)
export default function GrammarScreen() {
  const { t } = useLanguage();
  const token = useSelector((st: RootState) => st.auth.token)!;
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [query, setQuery] = useState('');
  const [viewIndex, setViewIndex] = useState<number | null>(null); // bài đang xem trong danh sách đã lọc
  const [flipped, setFlipped] = useState(false);

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

  // Mở / chuyển bài: luôn bắt đầu ở mặt trước
  const open = (i: number) => {
    setViewIndex(i);
    setFlipped(false);
  };

  const g = viewIndex !== null ? shown[viewIndex] : null;

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, styles.search, s.searchBox]}
        placeholder={t('SEARCH')}
        placeholderTextColor={color.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <Text style={[styles.muted, styles.count]}>
        {shown.length} / {grammars.length}
      </Text>

      {/* Danh sách gọn: tên bài + công thức */}
      <FlatList
        data={shown}
        keyExtractor={item => item._id}
        ItemSeparatorComponent={Separator}
        style={styles.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.listItem} onPress={() => open(index)}>
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

      {/* Xem dạng thẻ: chạm để lật, ‹ › để chuyển bài */}
      <Modal
        visible={g !== null}
        animationType="slide"
        onRequestClose={() => setViewIndex(null)}
      >
        {g && (
          <SafeAreaView style={styles.container}>
            <View style={[styles.row, s.viewerTop]}>
              <Text style={styles.muted}>
                {viewIndex! + 1} / {shown.length}
              </Text>
              <TouchableOpacity onPress={() => setViewIndex(null)}>
                <Text style={s.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <Pressable
              style={[styles.card, s.flashcard]}
              onPress={() => setFlipped(f => !f)}
            >
              {!flipped ? (
                // Mặt trước: tên bài + công thức
                <View style={s.front}>
                  <Text style={styles.levelBadge}>{g.level}</Text>
                  <Text style={s.title}>{g.title}</Text>
                  {!!g.structure && (
                    <Text style={s.structure}>{g.structure}</Text>
                  )}
                  <Text style={[styles.muted, s.hint]}>{t('TAP_TO_FLIP')}</Text>
                </View>
              ) : (
                // Mặt sau: cách dùng, ví dụ, lưu ý
                <ScrollView>
                  <Text style={s.backTitle}>{g.title}</Text>
                  <Text style={s.section}>{t('USAGE')}</Text>
                  {g.usage.map((u, i) => (
                    <Text key={i} style={s.text}>
                      • {u}
                    </Text>
                  ))}
                  <Text style={s.section}>{t('EXAMPLES')}</Text>
                  {g.examples.map((ex, i) => (
                    <View key={i} style={s.example}>
                      <Text style={s.exampleEn}>{ex.en}</Text>
                      <Text style={styles.muted}>{ex.vi}</Text>
                    </View>
                  ))}
                  {!!g.notes && (
                    <View style={s.notes}>
                      <Text style={s.notesTitle}>{t('NOTES')}</Text>
                      <Text style={s.text}>{g.notes}</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </Pressable>

            <View style={[styles.row, s.nav]}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonSoft,
                  styles.flex1,
                  viewIndex === 0 && styles.disabled,
                ]}
                disabled={viewIndex === 0}
                onPress={() => open(viewIndex! - 1)}
              >
                <Text style={styles.buttonSoftText}>‹ {t('PREV')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.flex1,
                  viewIndex === shown.length - 1 && styles.disabled,
                ]}
                disabled={viewIndex === shown.length - 1}
                onPress={() => open(viewIndex! + 1)}
              >
                <Text style={styles.buttonText}>{t('NEXT')} ›</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
}

const Separator = () => <View style={styles.separator} />;

const s = StyleSheet.create({
  searchBox: { flex: 0 },
  viewerTop: { justifyContent: 'space-between', marginBottom: 12 },
  close: { fontSize: 22, color: color.textMuted, paddingHorizontal: 8 },
  flashcard: { flex: 1, borderTopWidth: 6, borderTopColor: color.accent },
  front: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: color.text,
    textAlign: 'center',
  },
  structure: {
    fontSize: 18,
    fontWeight: '600',
    color: color.primary,
    textAlign: 'center',
  },
  hint: { marginTop: 12 },
  backTitle: { fontSize: 20, fontWeight: 'bold', color: color.text },
  section: {
    fontSize: 15,
    fontWeight: '700',
    color: color.primary,
    marginTop: 16,
    marginBottom: 6,
  },
  text: { fontSize: 15, color: color.text, lineHeight: 22 },
  example: { marginBottom: 8 },
  exampleEn: { fontSize: 15, fontWeight: '600', color: color.text },
  notes: {
    backgroundColor: color.accentLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  notesTitle: { fontWeight: '700', color: color.accent, marginBottom: 4 },
  nav: { marginTop: 16 },
});
