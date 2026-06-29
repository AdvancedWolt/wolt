// Single source of truth for showing prices, so the shekel symbol and the
// two-decimal rule stay consistent everywhere.
export const formatPrice = (value) => `₪${Number(value ?? 0).toFixed(2)}`;
