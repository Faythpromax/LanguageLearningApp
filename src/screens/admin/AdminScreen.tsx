import React, { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as api from '../../api';
import { color } from '../../constants/theme';
import { useLanguage } from '../../lang';
import type { RootState } from '../../store';
import { styles } from '../../styles';

// Dashboard admin tạm thời: tổng số từ vựng và bài ngữ pháp, kéo xuống để làm mới
export default function AdminScreen() {
  const { t } = useLanguage();
  const token = useSelector((st: RootState) => st.auth.token);
  const [stats, setStats] = useState({ words: 0, grammars: 0 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await api.getAdminStats(token!));
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

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={styles.title}>{t('DASHBOARD')}</Text>
      <View style={styles.row}>
        <View style={[s.tile, s.blue]}>
          <Text style={s.number}>{stats.words}</Text>
          <Text style={s.caption}>{t('TOTAL_WORDS')}</Text>
        </View>
        <View style={[s.tile, s.orange]}>
          <Text style={s.number}>{stats.grammars}</Text>
          <Text style={s.caption}>{t('TOTAL_GRAMMARS')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tile: { flex: 1, borderRadius: 16, padding: 20 },
  blue: { backgroundColor: color.primary },
  orange: { backgroundColor: color.accent },
  number: { fontSize: 36, fontWeight: 'bold', color: color.white },
  caption: { fontSize: 15, color: color.white, marginTop: 4 },
});
