import { API_URL } from './config';

export type User = {
  name: string;
  email: string;
  role: 'user' | 'admin';
  newCardsPerDay: number;
};

export type Word = {
  _id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaning: string;
  example?: string;
  exampleMeaning?: string;
};

// Hàm gọi API dùng chung: tự thêm Content-Type, tự đính kèm token (nếu có),
// và tự ném lỗi khi server trả về status lỗi (vd 401, 400).
async function request(
  path: string,
  options: RequestInit = {},
  token?: string,
) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json', // gửi dữ liệu JSON cho backend
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // gửi token nếu có
      ...(options.headers || {}),
    },
  });

  const data = await res.json(); // đọc dữ liệu JSON trả về từ server
  if (!res.ok) {
    throw new Error(data.error || 'Co loi xay ra');
  }
  return data;
}

// Auth
export function register(email: string, password: string, name: string) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export function login(email: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Tài khoản
export function getMe(token: string): Promise<User> {
  return request('/users/me', {}, token);
}

export function updateMe(newCardsPerDay: number, token: string): Promise<User> {
  return request(
    '/users/me',
    { method: 'PATCH', body: JSON.stringify({ newCardsPerDay }) },
    token,
  );
}

// Học từ vựng
export function getStudyToday(
  token: string,
): Promise<{ newCards: Word[]; reviewCards: Word[] }> {
  return request('/study/today', {}, token);
}

export function answerCard(
  wordId: string,
  result: 'again' | 'good',
  token: string,
) {
  return request(
    '/study/answer',
    { method: 'POST', body: JSON.stringify({ wordId, result }) },
    token,
  );
}

export function addExtraCards(
  count: number,
  token: string,
): Promise<{ newCards: Word[] }> {
  return request(
    '/study/extra',
    { method: 'POST', body: JSON.stringify({ count }) },
    token,
  );
}

// Admin
export function getAdminStats(
  token: string,
): Promise<{ words: number; grammars: number }> {
  return request('/admin/stats', {}, token);
}
