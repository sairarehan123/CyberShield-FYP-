const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD_LENGTH = 8;

const BLOCKED_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'fake.com',
  'invalid.com',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'getnada.com',
  'sharklasers.com',
]);

export const validateName = (v) => (!v.trim() ? 'Full name is required.' : '');

export const validateEmail = (v) => {
  const clean = v.trim().toLowerCase();
  if (!clean) return 'Email address is required.';
  if (!EMAIL_REGEX.test(clean)) return 'Invalid email address';

  const domain = clean.split('@')[1];
  if (!domain || BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return 'Invalid email address';
  }

  return '';
};

export const validatePassword = (v) => {
  if (!v) return 'Password is required.';
  if (v.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return '';
};

export const validateConfirm = (password, confirm) => {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return '';
};