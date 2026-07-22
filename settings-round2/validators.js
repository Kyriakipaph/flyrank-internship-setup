// Pure validation functions — shared between the browser form and the test runner.
// Exported for Node (tests) and attached to `window` in the browser.

function validateFullName(value) {
  if (value === undefined || value === null) return 'Full name is required.';
  const trimmed = String(value).trim();
  if (trimmed.length === 0) return 'Full name is required.';
  if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
  // Letters, spaces, hyphens, apostrophes — no digits, no other special chars.
  if (!/^[A-Za-z][A-Za-z\s'\-]*$/.test(trimmed)) {
    return 'Full name cannot contain numbers or special characters.';
  }
  return '';
}

function validateEmail(value) {
  if (value === undefined || value === null) return 'Email is required.';
  const trimmed = String(value).trim();
  if (trimmed.length === 0) return 'Email is required.';
  // Reasonable email regex: local@domain.tld, no spaces, TLD >=2 letters.
  const re = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  if (!re.test(trimmed)) return 'Please enter a valid email address.';
  return '';
}

const NOTIFICATION_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Never'];

function validateNotification(value) {
  if (!value) return 'Please choose a notification preference.';
  if (!NOTIFICATION_OPTIONS.includes(value)) {
    return 'Please choose a valid notification preference.';
  }
  return '';
}

function validatePassword(value) {
  if (value === undefined || value === null || value === '') return 'Password is required.';
  const v = String(value);
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (!/[0-9]/.test(v)) return 'Password must include at least one number.';
  if (!/[A-Z]/.test(v)) return 'Password must include at least one uppercase letter.';
  return '';
}

function validateConfirmPassword(password, confirm) {
  if (confirm === undefined || confirm === null || confirm === '') {
    return 'Please confirm your password.';
  }
  if (password !== confirm) return "The 2 passwords don't match.";
  return '';
}

function validateAll(values) {
  return {
    fullName: validateFullName(values.fullName),
    email: validateEmail(values.email),
    notification: validateNotification(values.notification),
    password: validatePassword(values.password),
    confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
  };
}

function isFormValid(errors) {
  return Object.values(errors).every((e) => e === '');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateFullName,
    validateEmail,
    validateNotification,
    validatePassword,
    validateConfirmPassword,
    validateAll,
    isFormValid,
    NOTIFICATION_OPTIONS,
  };
}

if (typeof window !== 'undefined') {
  window.SettingsValidators = {
    validateFullName,
    validateEmail,
    validateNotification,
    validatePassword,
    validateConfirmPassword,
    validateAll,
    isFormValid,
    NOTIFICATION_OPTIONS,
  };
}
