const test = require('node:test');
const assert = require('node:assert');
const { startOfToday, startOfTomorrow, todayKey } = require('./day');

// 23:30 ngày 05/11 giờ VN = 16:30 UTC
test('23:30 VN: Good hẹn 00:00 ngày 06/11 VN', () => {
    const now = new Date('2026-11-05T16:30:00Z');
    assert.strictEqual(todayKey(now), '2026-11-05');
    assert.strictEqual(startOfToday(now).toISOString(), '2026-11-04T17:00:00.000Z');
    assert.strictEqual(startOfTomorrow(now).toISOString(), '2026-11-05T17:00:00.000Z');
});

// 00:30 ngày 06/11 giờ VN = 17:30 UTC ngày 05/11, đã sang ngày mới
test('00:30 VN thuộc ngày mới', () => {
    const now = new Date('2026-11-05T17:30:00Z');
    assert.strictEqual(todayKey(now), '2026-11-06');
    assert.strictEqual(startOfToday(now).toISOString(), '2026-11-05T17:00:00.000Z');
});
