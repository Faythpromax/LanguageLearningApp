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
  level?: 'A1' | 'A2' | 'B1' | 'B2';
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

// Admin: quản lý từ vựng
export type WordInput = Omit<Word, '_id'>;

export function getWords(token: string): Promise<Word[]> {
  return request('/words', {}, token);
}

export function createWord(input: WordInput, token: string): Promise<Word> {
  return request(
    '/words',
    { method: 'POST', body: JSON.stringify(input) },
    token,
  );
}

export function updateWord(
  id: string,
  input: WordInput,
  token: string,
): Promise<Word> {
  return request(
    `/words/${id}`,
    { method: 'PUT', body: JSON.stringify(input) },
    token,
  );
}

export function deleteWord(id: string, token: string) {
  return request(`/words/${id}`, { method: 'DELETE' }, token);
}

// Ngữ pháp: người học xem, admin thêm/sửa/xóa
export type Grammar = {
  _id: string;
  title: string;
  structure?: string;
  usage: string[];
  examples: { en: string; vi: string }[];
  notes?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2';
  order?: number;
};
export type GrammarInput = Omit<Grammar, '_id'>;

export function getGrammars(token: string): Promise<Grammar[]> {
  return request('/grammars', {}, token);
}

export function createGrammar(
  input: GrammarInput,
  token: string,
): Promise<Grammar> {
  return request(
    '/grammars',
    { method: 'POST', body: JSON.stringify(input) },
    token,
  );
}

export function updateGrammar(
  id: string,
  input: GrammarInput,
  token: string,
): Promise<Grammar> {
  return request(
    `/grammars/${id}`,
    { method: 'PUT', body: JSON.stringify(input) },
    token,
  );
}

export function deleteGrammar(id: string, token: string) {
  return request(`/grammars/${id}`, { method: 'DELETE' }, token);
}

// Tra phiên âm IPA từ Free Dictionary API (miễn phí, không cần key).
// Không có dữ liệu (404) hoặc không có phiên âm thì trả '' để admin tự nhập.
export async function lookupPhonetic(word: string): Promise<string> {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
      word,
    )}`,
  );
  if (!res.ok) {
    return '';
  }
  const entries: { phonetic?: string; phonetics?: { text?: string }[] }[] =
    await res.json();
  for (const e of entries) {
    const text = e.phonetic || e.phonetics?.find(p => p.text)?.text;
    if (text) {
      return text;
    }
  }
  return '';
}

// Admin: dashboard
export function getAdminStats(
  token: string,
): Promise<{ words: number; grammars: number }> {
  return request('/admin/stats', {}, token);
}
