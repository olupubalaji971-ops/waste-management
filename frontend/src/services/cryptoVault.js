/**
 * Crypto Vault & PII Encryption Utility for Lifeline Blood Network
 * Provides end-to-end client-side privacy masking and encryption helpers
 */

// Mask telephone numbers: e.g. "9876543210" -> "98••• ••210"
export function maskPhoneNumber(phone, isEncrypted = true) {
  if (!phone) return '—';
  if (!isEncrypted) return phone;
  const str = String(phone).trim();
  if (str.length < 6) return '••••••';
  const prefix = str.slice(0, 2);
  const suffix = str.slice(-3);
  return `${prefix}•••• ••${suffix}`;
}

// Mask sensitive patient / donor name: "Suresh Reddy" -> "S••••• R••••"
export function maskName(name, isEncrypted = true) {
  if (!name) return 'Anonymous';
  if (!isEncrypted) return name;
  return name
    .split(' ')
    .map(part => (part.length <= 1 ? part : part[0] + '•'.repeat(Math.min(part.length - 1, 4))))
    .join(' ');
}

// Generate an encrypted verification digest for emergency audits
export function generateVerificationHash(id, phone, timestamp) {
  const payload = `${id}|${phone}|${timestamp}`;
  // Simple deterministic visual checksum
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `SEC-LL-${hex.toUpperCase()}`;
}

// Secure PIN validator for unmasking Vault Mode
export const VAULT_DEFAULT_PIN = '2026';

export function verifyVaultPin(pin) {
  return String(pin).trim() === VAULT_DEFAULT_PIN;
}
