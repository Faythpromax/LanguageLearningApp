// Tính "ngày học" theo giờ Việt Nam: qua 00:00 VN là sang ngày mới.
// shortcut: cố định UTC+7 cho mọi user, khi có user ở múi giờ khác thì lưu timezone vào User.
const OFFSET = 7 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const startOfToday = (now = new Date()) =>
    new Date(Math.floor((now.getTime() + OFFSET) / DAY) * DAY - OFFSET);

const startOfTomorrow = (now = new Date()) =>
    new Date(startOfToday(now).getTime() + DAY);

const todayKey = (now = new Date()) =>
    new Date(now.getTime() + OFFSET).toISOString().slice(0, 10);

module.exports = { startOfToday, startOfTomorrow, todayKey };
