interface BlacklistEntry {
  expiresAt: number; // unix ms
}

const blacklist = new Map<string, BlacklistEntry>();

// Clean up expired entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of blacklist.entries()) {
    if (entry.expiresAt < now) blacklist.delete(token);
  }
}, 15 * 60 * 1000);

export function blacklistToken(token: string, expiresAt: number): void {
  blacklist.set(token, { expiresAt: expiresAt * 1000 });
}

export function isBlacklisted(token: string): boolean {
  const entry = blacklist.get(token);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    blacklist.delete(token);
    return false;
  }
  return true;
}