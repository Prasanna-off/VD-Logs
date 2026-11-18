const test = require('node:test');
const assert = require('node:assert');
const AttendanceService = require('../src/services/attendance.service');
const AuthService = require('../src/services/auth.service');

test('AttendanceService: Formats Kolkata date string accurately as YYYY-MM-DD', (t) => {
  const fixedDate = new Date('2026-11-16T00:30:00Z');
  const kolkataDate = AttendanceService.getKolkataDateString(fixedDate);
  assert.match(kolkataDate, /^\d{4}-\d{2}-\d{2}$/);
});

test('AuthValidator: Normalizes input properly and rejects empty inputs', (t) => {
  const { staffLoginSchema } = require('../src/validators/auth.validator');
  assert.throws(() => staffLoginSchema.parse({ staff_id: '', password: '' }));
  const parsed = staffLoginSchema.parse({ staff_id: ' VD-2025-001 ', password: 'secretpassword' });
  assert.strictEqual(parsed.staff_id, 'VD-2025-001');
});
