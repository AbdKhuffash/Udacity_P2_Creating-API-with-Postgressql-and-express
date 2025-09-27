export const uniqueEmail = (prefix = 't') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@ex.com`;
