// Shared field rules so the register, login and account forms agree on what a
// valid value is (and stay in step with the server's own validation). Each
// returns an empty string when the value is valid, or a message to show.

export const requiredField = (value, label) => (
  value && String(value).trim() ? '' : `${label} is required`
);

export const validateUsername = (value) => {
  if (!value || !value.trim()) return 'Username is required';
  if (value.trim().length < 3) return 'Username must be at least 3 characters';
  return '';
};

export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter';
  if (!/\d/.test(value)) return 'Password must contain at least one digit';
  return '';
};

export const validateConfirmPassword = (value, form) => {
  if (!value) return 'Please confirm your password';
  if (value !== form.password) return 'Passwords do not match';
  return '';
};

export const validateDisplayName = (value) => (
  value && value.trim() ? '' : 'Display name is required'
);

export const validateCoordinate = (value, label = 'Coordinate') => {
  if (value === '' || value === undefined || value === null) return `${label} is required`;
  if (Number.isNaN(Number(value))) return `${label} must be a number`;
  return '';
};
