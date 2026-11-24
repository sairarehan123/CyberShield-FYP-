// Rules intentionally mirror the frontend (src/utils/validation.js) so a request the app accepts is
// accepted here too: name required, same email regex, password >= 8 characters, confirm must match.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt (used by Supabase Auth) ignores anything past 72 bytes
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

const isString = (v) => typeof v === 'string';

const validateName = (v) => {
  if (!isString(v) || !v.trim()) return 'Full name is required.';
  if (v.trim().length > MAX_NAME_LENGTH) return `Full name must be at most ${MAX_NAME_LENGTH} characters.`;
  return '';
};

const validateEmail = (v) => {
  if (!isString(v) || !v.trim()) return 'Email address is required.';
  if (v.trim().length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(v.trim())) return 'Enter a valid email address.';
  return '';
};

const validatePassword = (v) => {
  if (!isString(v) || !v) return 'Password is required.';
  if (v.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (Buffer.byteLength(v, 'utf8') > MAX_PASSWORD_LENGTH) return `Password must be at most ${MAX_PASSWORD_LENGTH} bytes.`;
  return '';
};

const validateConfirm = (password, confirm) => {
  if (!isString(confirm) || !confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return '';
};

const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));

// Field names match the frontend form state: name, email, password, confirm.
const validateRegister = (body = {}) => {
  const confirm = body.confirm !== undefined ? body.confirm : body.confirmPassword;
  return compact({
    name: validateName(body.name),
    email: validateEmail(body.email),
    password: validatePassword(body.password),
    confirm: validateConfirm(body.password, confirm),
  });
};

const validateLogin = (body = {}) =>
  compact({
    email: validateEmail(body.email),
    password: isString(body.password) && body.password ? '' : 'Password is required.',
  });

const ALLOWED_PROFILE_FIELDS = ['name'];

const validateProfileUpdate = (body = {}) => {
  const keys = Object.keys(body || {});
  if (keys.length === 0) return { name: 'Provide at least one field to update.' };
  const unknown = keys.filter((k) => !ALLOWED_PROFILE_FIELDS.includes(k));
  if (unknown.length) return { _: `These fields cannot be updated: ${unknown.join(', ')}.` };
  return compact({ name: 'name' in body ? validateName(body.name) : '' });
};

module.exports = { validateRegister, validateLogin, validateProfileUpdate };
