// Chạy lệnh adb reverse tcp:3000 tcp:3000 để điện thoại gọi localhost:3000 về máy tính.
export const API_URL = 'http://localhost:3000';

// Thời gian phiên đăng nhập (ms): 1 ngày, khớp expiresIn của JWT ở backend
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
