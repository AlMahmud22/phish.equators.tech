/**
 * Password validation utilities
 */

export interface PasswordStrength {
  score: number; // 0-4
  label: string; // 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'
  feedback: string[];
  isValid: boolean;
}

/**
 * Validate password strength and requirements
 */
export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else if (password.length >= 8) {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Include at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Include at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push('Include at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Include at least one special character (!@#$%^&* etc.)');
  } else {
    score += 1;
  }

  // Bonus points for length
  if (password.length >= 12) {
    score += 1;
  }
  if (password.length >= 16) {
    score += 1;
  }

  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /^(123|abc|qwerty|password)/i,
    /^(admin|user|test|demo)/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push('Avoid common patterns or repeated characters');
      score = Math.max(0, score - 1);
      break;
    }
  }

  // Determine strength label
  let label = 'Weak';
  if (score >= 6) label = 'Very Strong';
  else if (score >= 5) label = 'Strong';
  else if (score >= 4) label = 'Good';
  else if (score >= 3) label = 'Fair';

  // Password is valid if it meets minimum requirements
  const isValid = 
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  return {
    score: Math.min(4, Math.floor(score / 2)), // Normalize to 0-4
    label,
    feedback,
    isValid,
  };
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(length);
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      token += chars[randomValues[i] % chars.length];
    }
  } else {
    // Fallback for Node.js environment
    const cryptoNode = require('crypto');
    token = cryptoNode.randomBytes(length).toString('hex').slice(0, length);
  }
  
  return token;
}

/**
 * Server-side token generation (using Node.js crypto)
 */
export function generateSecureToken(length: number = 32): string {
  try {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    // Fallback if crypto is not available
    return generateToken(length);
  }
}

/**
 * Hash token for secure storage (if needed)
 */
export function hashToken(token: string): string {
  try {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  } catch (error) {
    return token; // Fallback
  }
}
