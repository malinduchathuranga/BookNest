// Simple localStorage cache with TTL
const TTL = {
  short: 2 * 60 * 1000,   // 2 min  — book lists (change often)
  long:  10 * 60 * 1000,  // 10 min — categories (rarely change)
};

export const cache = {
  get(key) {
    try {
      const item = localStorage.getItem('cache_' + key);
      if (!item) return null;
      const { data, expiresAt } = JSON.parse(item);
      if (Date.now() > expiresAt) { localStorage.removeItem('cache_' + key); return null; }
      return data;
    } catch { return null; }
  },

  set(key, data, ttl = TTL.short) {
    try {
      localStorage.setItem('cache_' + key, JSON.stringify({ data, expiresAt: Date.now() + ttl }));
    } catch {} // ignore if storage full
  },

  clear(key) {
    localStorage.removeItem('cache_' + key);
  },

  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('cache_'))
      .forEach(k => localStorage.removeItem(k));
  },

  TTL,
};
