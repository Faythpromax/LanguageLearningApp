import AsyncStorage from '@react-native-async-storage/async-storage';
import { SESSION_DURATION_MS } from './config';

const KEY = 'session';

type Session = { token: string; expiresAt: number };

// Lưu token kèm thời điểm hết hạn (giờ hiện tại + thời hạn phiên)
export async function saveSession(token: string): Promise<Session> {
  const session = { token, expiresAt: Date.now() + SESSION_DURATION_MS };
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

// Trả về phiên còn hạn, hoặc null nếu chưa có / đã hết hạn (và xóa luôn phiên cũ)
export async function loadSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return null;
  }
  const session: Session = JSON.parse(raw);
  if (Date.now() >= session.expiresAt) {
    await clearSession();
    return null;
  }
  return session;
}

export function clearSession() {
  return AsyncStorage.removeItem(KEY);
}
