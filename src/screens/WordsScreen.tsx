import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as api from '../api';
import type { Word } from '../api';
import { color } from '../constants/theme';
import { useLanguage } from '../lang';
import type { RootState } from '../store';
import { styles } from '../styles';

// Màn học từ vựng kiểu Anki: học hết stack New rồi mới tới stack Review
export default function WordsScreen() {
  const { t } = useLanguage();
  const token = useSelector((st: RootState) => st.auth.token)!;
  const [newStack, setNewStack] = useState<Word[]>([]);
  const [reviewStack, setReviewStack] = useState<Word[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [askCount, setAskCount] = useState(false); // đang mở hộp nhập số thẻ Add more
  const [countText, setCountText] = useState('');

  // Tải hàng đợi hôm nay mỗi lần mở tab (để nhận số từ/ngày vừa đổi ở màn Tài khoản)
  const load = useCallback(async () => {
    try {
      const data = await api.getStudyToday(token);
      setNewStack(data.newCards);
      setReviewStack(data.reviewCards);
      setFlipped(false);
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const fromNew = newStack.length > 0;
  const card = fromNew ? newStack[0] : reviewStack[0];

  // Again: đưa thẻ xuống cuối stack Review. Good: bỏ thẻ khỏi hôm nay.
  // Cập nhật giao diện trước, gọi API sau; lỗi thì tải lại hàng đợi từ server.
  const answer = async (result: 'again' | 'good') => {
    setFlipped(false);
    if (fromNew) {
      setNewStack(s => s.slice(1));
    } else {
      setReviewStack(s => s.slice(1));
    }
    if (result === 'again') {
      setReviewStack(s => [...s, card]);
    }
    try {
      await api.answerCard(card._id, result, token);
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
      load();
    }
  };

  // Add more cards: server trả lại toàn bộ stack New còn lại hôm nay nên thay cả stack
  const addMore = async () => {
    const n = Number(countText);
    if (!Number.isInteger(n) || n < 1 || n > 50) {
      Alert.alert(t('ERROR'), t('INVALID_COUNT'));
      return;
    }
    setAskCount(false);
    setCountText('');
    try {
      const data = await api.addExtraCards(n, token);
      if (data.newCards.length === newStack.length) {
        Alert.alert(t('NO_MORE_WORDS'));
      }
      setNewStack(data.newCards);
    } catch (e: any) {
      Alert.alert(t('ERROR'), e.message);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.container} color={color.primary} />;
  }

  return (
    <View style={styles.container}>
      {/* Số thẻ còn lại của 2 stack + nút thêm thẻ */}
      <View style={[styles.row, s.topBar]}>
        <Text style={[s.badge, s.badgeNew]}>
          {t('NEW')} {newStack.length}
        </Text>
        <Text style={[s.badge, s.badgeReview]}>
          {t('REVIEW')} {reviewStack.length}
        </Text>
        <View style={styles.flex1} />
        <TouchableOpacity style={s.addButton} onPress={() => setAskCount(true)}>
          <Text style={s.addText}>+ {t('ADD_MORE')}</Text>
        </TouchableOpacity>
      </View>

      {!card ? (
        // Hết thẻ hôm nay
        <View style={s.center}>
          <Text style={s.doneIcon}>🎉</Text>
          <Text style={s.doneText}>{t('DONE_TODAY')}</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonAccent]}
            onPress={() => setAskCount(true)}
          >
            <Text style={styles.buttonText}>{t('ADD_MORE')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Thẻ giữa màn hình: chạm để lật */}
          <Pressable
            style={[styles.card, s.flashcard]}
            onPress={() => setFlipped(f => !f)}
          >
            <Text style={s.word}>{card.word}</Text>
            {!!card.phonetic && (
              <Text style={styles.muted}>{card.phonetic}</Text>
            )}
            {flipped ? (
              <View style={s.back}>
                {!!card.partOfSpeech && (
                  <Text style={s.pos}>{card.partOfSpeech}</Text>
                )}
                <Text style={s.meaning}>{card.meaning}</Text>
                {!!card.example && (
                  <Text style={s.example}>{card.example}</Text>
                )}
                {!!card.exampleMeaning && (
                  <Text style={styles.muted}>{card.exampleMeaning}</Text>
                )}
              </View>
            ) : (
              <Text style={[styles.muted, s.hint]}>{t('TAP_TO_FLIP')}</Text>
            )}
          </Pressable>

          {/* Chỉ trả lời được sau khi đã lật thẻ */}
          {flipped && (
            <View style={[styles.row, s.answers]}>
              <TouchableOpacity
                style={[styles.button, styles.buttonAccent, styles.flex1]}
                onPress={() => answer('again')}
              >
                <Text style={styles.buttonText}>{t('AGAIN')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.flex1]}
                onPress={() => answer('good')}
              >
                <Text style={styles.buttonText}>{t('GOOD')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Hộp nhập số thẻ muốn thêm */}
      <Modal
        transparent
        visible={askCount}
        animationType="fade"
        onRequestClose={() => setAskCount(false)}
      >
        <View style={s.overlay}>
          <View style={[styles.card, s.dialog]}>
            <Text style={s.dialogTitle}>{t('HOW_MANY')}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              autoFocus
              value={countText}
              onChangeText={setCountText}
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, s.cancel, styles.flex1]}
                onPress={() => setAskCount(false)}
              >
                <Text style={s.cancelText}>{t('CANCEL')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonAccent, styles.flex1]}
                onPress={addMore}
              >
                <Text style={styles.buttonText}>{t('OK')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  topBar: { marginBottom: 16, gap: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  badgeNew: { backgroundColor: color.primaryLight, color: color.primary },
  badgeReview: { backgroundColor: color.accentLight, color: color.accent },
  addButton: {
    borderWidth: 1,
    borderColor: color.accent,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addText: { color: color.accent, fontWeight: '700' },
  flashcard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 6,
    borderTopColor: color.primary,
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 6,
  },
  back: { alignItems: 'center', marginTop: 20, gap: 8 },
  pos: { color: color.accent, fontStyle: 'italic' },
  meaning: {
    fontSize: 24,
    fontWeight: '600',
    color: color.primary,
    textAlign: 'center',
  },
  example: {
    fontSize: 16,
    color: color.text,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  hint: { marginTop: 24 },
  answers: { marginTop: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  doneIcon: { fontSize: 48 },
  doneText: {
    fontSize: 20,
    fontWeight: '600',
    color: color.text,
    marginBottom: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: color.overlay,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: { gap: 4 },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
    marginBottom: 8,
  },
  cancel: { backgroundColor: color.primaryLight },
  cancelText: { color: color.primary, fontSize: 16, fontWeight: '600' },
});
