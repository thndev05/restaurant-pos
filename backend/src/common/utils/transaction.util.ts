/**
 * Transaction ID Generator Utility
 *
 * Generates unique transaction IDs for payments.
 * Format: TX + 10 alphanumeric characters (excluding confusing characters)
 *
 * This ID is used for third-party payment integration and lookup.
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ID_LENGTH = 10;

/**
 * Generate a unique transaction ID
 * @returns A transaction ID in format: TX{10 characters}
 * @example "TXAB3C4D5E6F"
 */
export function generateTransactionId(): string {
  let result = 'TX';

  for (let i = 0; i < ID_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    result += ALPHABET[randomIndex];
  }

  return result;
}

/**
 * Validate transaction ID format
 * @param transactionId The transaction ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidTransactionId(transactionId: string): boolean {
  if (!transactionId || transactionId.length !== ID_LENGTH + 2) {
    return false;
  }

  if (!transactionId.startsWith('TX')) {
    return false;
  }

  const idPart = transactionId.substring(2);
  for (const char of idPart) {
    if (!ALPHABET.includes(char)) {
      return false;
    }
  }

  return true;
}
