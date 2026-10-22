import { API_URL } from './config';

// Hàm gọi API dùng chung: tự thêm Content-Type, tự đính kèm token (nếu có),
// và tự ném lỗi khi server trả về status lỗi (vd 401, 400).
async function request(path: string, options: RequestInit = {}, token?: string) {
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

export function getWords(token: string) {
  return request('/words', {}, token);
}

export function createWord(
  input: { word: string; meaning: string },
  token: string,
) {
  return request(
    '/words',
    { method: 'POST', body: JSON.stringify(input) },
    token,
  );
}
