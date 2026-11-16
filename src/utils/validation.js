const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD_LENGTH = 8;

export const validateName = (v) => (!v.trim() ? 'Full name is required.' : '');

export const validateEmail = (v) => {
  if (!v.trim()) return 'Email address is required.';
  if (!EMAIL_REGEX.test(v.trim())) return 'Enter a valid email address.';
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
