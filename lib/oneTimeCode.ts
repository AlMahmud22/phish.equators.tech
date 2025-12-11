/**
 * One-Time Code Generator for Desktop OAuth Flow
 * Generates, stores, and validates one-time codes for secure desktop authentication
 */

import { randomBytes } from "crypto";

interface OneTimeCode {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
  consumed: boolean;
}

/**
 * In-memory storage for one-time codes
 * For production, consider using Redis or database
 */
const codeStore = new Map<string, OneTimeCode>();

/**
 * Configuration
 */
const CODE_LENGTH = 32; // Length of the code in bytes (64 hex characters)
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // Clean up every 10 minutes

/**
 * Generate a cryptographically secure one-time code
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @returns The generated code
 */
export function generateOneTimeCode(
  userId: string,
  email: string,
  role: string
): string {
  // Generate random code
  const code = randomBytes(CODE_LENGTH).toString("hex");

  // Store code with metadata
  const now = Date.now();
  codeStore.set(code, {
    userId,
    email,
    role,
    createdAt: now,
    expiresAt: now + CODE_EXPIRY_MS,
    consumed: false,
  });

  console.log(`[OneTimeCode] Generated code for user ${email}, expires in ${CODE_EXPIRY_MS / 1000}s`);

  return code;
}

/**
 * Validate and consume a one-time code
 * @param code - The code to validate
 * @returns User data if valid, null if invalid/expired/consumed
 */
export function validateAndConsumeCode(code: string): {
  userId: string;
  email: string;
  role: string;
} | null {
  const data = codeStore.get(code);

  if (!data) {
    console.log(`[OneTimeCode] Code not found: ${code.substring(0, 8)}...`);
    return null;
  }

  // Check if expired
  if (Date.now() > data.expiresAt) {
    console.log(`[OneTimeCode] Code expired for user ${data.email}`);
    codeStore.delete(code);
    return null;
  }

  // Check if already consumed
  if (data.consumed) {
    console.log(`[OneTimeCode] Code already consumed for user ${data.email}`);
    return null;
  }

  // Mark as consumed
  data.consumed = true;
  codeStore.set(code, data);

  // Delete after a short delay to prevent replay attacks
  setTimeout(() => {
    codeStore.delete(code);
  }, 1000);

  console.log(`[OneTimeCode] Code validated and consumed for user ${data.email}`);

  return {
    userId: data.userId,
    email: data.email,
    role: data.role,
  };
}

/**
 * Get information about a code without consuming it (for debugging)
 * @param code - The code to check
 * @returns Code information or null
 */
export function getCodeInfo(code: string): OneTimeCode | null {
  return codeStore.get(code) || null;
}

/**
 * Clean up expired codes
 * Called periodically to prevent memory leaks
 */
export function cleanupExpiredCodes(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [code, data] of codeStore.entries()) {
    if (now > data.expiresAt) {
      codeStore.delete(code);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[OneTimeCode] Cleaned up ${cleaned} expired codes`);
  }

  return cleaned;
}

/**
 * Start automatic cleanup interval
 */
export function startCleanupInterval(): NodeJS.Timeout {
  return setInterval(cleanupExpiredCodes, CLEANUP_INTERVAL_MS);
}

/**
 * Get current store size (for monitoring)
 */
export function getStoreSize(): number {
  return codeStore.size;
}

// Start cleanup on module load
if (typeof global !== "undefined") {
  startCleanupInterval();
}
