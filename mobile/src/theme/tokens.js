// The design tokens for the whole app. Light and dark share the same shape, so
// any component can read `theme.<name>` and switch automatically. Brand colour
// is Wolt's signature cyan.

const brand = '#00b8d9';

export const lightTheme = {
  mode: 'light',
  brand,
  brandSoft: '#e1f7fc',
  onBrand: '#00303a',
  background: '#f6f6f8',
  surface: '#eeeef1',
  card: '#ffffff',
  text: '#101114',
  muted: '#6b7280',
  border: '#e6e7eb',
  danger: '#e23744',
  dangerSoft: '#fdecee',
  success: '#1fa463',
};

export const darkTheme = {
  mode: 'dark',
  brand: '#19c3e6',
  brandSoft: '#0c2b33',
  onBrand: '#04222a',
  background: '#0e0f12',
  surface: '#17181c',
  card: '#1d1f24',
  text: '#f4f5f7',
  muted: '#9aa0aa',
  border: '#2a2c33',
  danger: '#ff6b74',
  dangerSoft: '#2a1416',
  success: '#36c98c',
};
