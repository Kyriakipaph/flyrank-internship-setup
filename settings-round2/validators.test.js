const V = require('./validators');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, err });
    console.log(`  FAIL ${name}`);
    console.log(`       ${err.message}`);
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || ''} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertOk(err) {
  if (err !== '') throw new Error(`expected no error, got: "${err}"`);
}

function assertErr(err, mustInclude) {
  if (err === '') throw new Error(`expected an error message, got empty`);
  if (mustInclude && !err.toLowerCase().includes(mustInclude.toLowerCase())) {
    throw new Error(`expected error to include "${mustInclude}", got: "${err}"`);
  }
}

console.log('\nFull Name');
test('rejects empty string', () => assertErr(V.validateFullName(''), 'required'));
test('rejects whitespace only', () => assertErr(V.validateFullName('   '), 'required'));
test('rejects single character', () => assertErr(V.validateFullName('A'), '2 characters'));
test('rejects names containing digits', () => assertErr(V.validateFullName('John2'), 'numbers'));
test('rejects names with special characters', () => assertErr(V.validateFullName('John@Doe'), 'special'));
test('rejects names starting with a symbol', () => assertErr(V.validateFullName("'Alice"), 'special'));
test('accepts a normal two-word name', () => assertOk(V.validateFullName('Jane Doe')));
test("accepts hyphenated & apostrophe names", () => assertOk(V.validateFullName("Mary-Anne O'Neil")));

console.log('\nEmail');
test('rejects empty', () => assertErr(V.validateEmail(''), 'required'));
test('rejects missing @', () => assertErr(V.validateEmail('userexample.com'), 'valid'));
test('rejects missing domain', () => assertErr(V.validateEmail('user@'), 'valid'));
test('rejects missing TLD', () => assertErr(V.validateEmail('user@example'), 'valid'));
test('rejects trailing spaces inside', () => assertErr(V.validateEmail('us er@example.com'), 'valid'));
test('rejects short TLD (1 char)', () => assertErr(V.validateEmail('user@example.c'), 'valid'));
test('accepts a normal address', () => assertOk(V.validateEmail('user@example.com')));
test('accepts subdomain address', () => assertOk(V.validateEmail('a.b+tag@mail.example.co')));

console.log('\nNotification');
test('rejects empty selection', () => assertErr(V.validateNotification(''), 'choose'));
test('rejects unknown value', () => assertErr(V.validateNotification('Hourly'), 'valid'));
['Daily', 'Weekly', 'Monthly', 'Never'].forEach((opt) => {
  test(`accepts "${opt}"`, () => assertOk(V.validateNotification(opt)));
});

console.log('\nPassword');
test('rejects empty', () => assertErr(V.validatePassword(''), 'required'));
test('rejects <8 chars', () => assertErr(V.validatePassword('Ab1cd'), '8 characters'));
test('rejects no number', () => assertErr(V.validatePassword('Abcdefgh'), 'number'));
test('rejects no uppercase', () => assertErr(V.validatePassword('abcdefg1'), 'uppercase'));
test('accepts valid password', () => assertOk(V.validatePassword('Abcdefg1')));
test('accepts long valid password', () => assertOk(V.validatePassword('MyStrongPass9!')));

console.log('\nConfirm Password');
test('rejects empty confirm', () => assertErr(V.validateConfirmPassword('Abcdefg1', ''), 'confirm'));
test("rejects mismatched confirm with specific 'don't match' message", () => {
  const msg = V.validateConfirmPassword('Abcdefg1', 'Abcdefg2');
  assertErr(msg, "don't match");
});
test('accepts identical passwords', () => assertOk(V.validateConfirmPassword('Abcdefg1', 'Abcdefg1')));

console.log('\nvalidateAll / isFormValid');
test('isFormValid=false for empty values', () => {
  const errs = V.validateAll({ fullName: '', email: '', notification: '', password: '', confirmPassword: '' });
  assertEqual(V.isFormValid(errs), false);
});
test('isFormValid=true for a fully valid submission', () => {
  const errs = V.validateAll({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    notification: 'Weekly',
    password: 'Secret12',
    confirmPassword: 'Secret12',
  });
  assertEqual(V.isFormValid(errs), true);
});
test('isFormValid=false when passwords mismatch', () => {
  const errs = V.validateAll({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    notification: 'Weekly',
    password: 'Secret12',
    confirmPassword: 'Secret13',
  });
  assertEqual(V.isFormValid(errs), false);
  assertErr(errs.confirmPassword, "don't match");
});

console.log(`\n---\nPassed: ${passed}   Failed: ${failed}\n`);
if (failed > 0) process.exit(1);
