/**
 * Password Security Utilities
 * Provides password strength validation, analysis, and generation
 * 
 * Security Requirements:
 * - Minimum 8 characters (6 enforced at API level for compatibility)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Special character recommended but not required
 */

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4; // 0=weak, 1=fair, 2=good, 3=strong, 4=very strong
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  feedback: string[];
  issues: string[];
  meetsMinimum: boolean;
  percentage: number;
}

/**
 * Validate password strength and provide detailed feedback
 * Based on OWASP recommended password policies
 */
export function analyzePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  const issues: string[] = [];
  let score = 0;

  // Length validation
  if (password.length < 6) {
    issues.push('Password must be at least 6 characters');
  } else if (password.length < 8) {
    issues.push('Consider using at least 8 characters for better security');
    score += 1;
  } else if (password.length < 12) {
    feedback.push('Good password length');
    score += 1;
  } else {
    feedback.push('Excellent password length (12+ characters)');
    score += 1;
  }

  // Uppercase letters
  if (!/[A-Z]/.test(password)) {
    issues.push('Add at least one uppercase letter (A-Z)');
  } else {
    feedback.push('✓ Contains uppercase letters');
    score += 1;
  }

  // Lowercase letters
  if (!/[a-z]/.test(password)) {
    issues.push('Add at least one lowercase letter (a-z)');
  } else {
    feedback.push('✓ Contains lowercase letters');
    score += 1;
  }

  // Numbers
  if (!/[0-9]/.test(password)) {
    issues.push('Add at least one number (0-9)');
  } else {
    feedback.push('✓ Contains numbers');
    score += 1;
  }

  // Special characters (bonus)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('✓ Contains special characters (excellent)');
    score += 1;
  }

  // Penalize common patterns (security hardening)
  if (/(.)\1{2,}/.test(password)) {
    // Repeated characters like "aaa" or "111"
    issues.push('Avoid repeating characters (e.g., "aaa")');
  }

  if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    // Only letters or only numbers
    issues.push('Mix letters and numbers for better security');
  }

  // Normalize score to 0-4
  const finalScore = Math.min(4, Math.max(0, score - 1)) as 0 | 1 | 2 | 3 | 4;

  const labels: Record<number, 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'> = {
    0: 'Weak',
    1: 'Fair',
    2: 'Good',
    3: 'Strong',
    4: 'Very Strong',
  };

  const percentages: Record<number, number> = {
    0: 20,
    1: 40,
    2: 60,
    3: 80,
    4: 100,
  };

  const meetsMinimum = password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

  return {
    score: finalScore,
    label: labels[finalScore],
    feedback,
    issues,
    meetsMinimum,
    percentage: percentages[finalScore],
  };
}

/**
 * Generate a strong password suggestion
 * Used to help users understand what a good password looks like
 */
export function generateSuggestedPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';

  // Build a password with guaranteed variety
  const password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
  ];

  // Shuffle
  return password.sort(() => Math.random() - 0.5).join('');
}

/**
 * Validate email format (RFC5322 simplified)
 * Checks basic structure without disposable domain list
 */
export function validateEmailStructure(email: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!email || email.trim() === '') {
    return { valid: false, issues: ['Email is required'] };
  }

  const normalized = email.trim().toLowerCase();

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    issues.push('Invalid email format');
    return { valid: false, issues };
  }

  // Check for multiple @ symbols
  if ((normalized.match(/@/g) || []).length > 1) {
    issues.push('Email contains multiple @ symbols');
  }

  // Check minimum length
  if (normalized.length < 5) {
    issues.push('Email is too short');
  }

  // Check for consecutive dots
  if (normalized.includes('..')) {
    issues.push('Email cannot contain consecutive dots');
  }

  // Warn about potential disposable email domains (optional check)
  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'tempmail.us',
  ];

  const domain = normalized.split('@')[1];
  if (disposableDomains.includes(domain)) {
    issues.push(`Disposable email domains may not be supported (${domain})`);
  }

  // Calculate if valid
  const valid = emailRegex.test(normalized) && issues.length === 0;

  return { valid, issues };
}

/**
 * Check if password contains common patterns that reduce security
 */
export function hasCommonPatterns(password: string): string[] {
  const patterns: string[] = [];

  // Sequential numbers/letters
  if (/(?:012|123|234|345|456|567|678|789|abc|bcd|cde|def)/.test(password.toLowerCase())) {
    patterns.push('Contains sequential characters (like 123 or abc)');
  }

  // Keyboard walks (like qwerty, asdf)
  if (/(?:qwert|asdf|zxcv|1234)/.test(password.toLowerCase())) {
    patterns.push('Contains keyboard patterns (like qwerty)');
  }

  // Common words (basic check)
  const commonWords = ['password', 'admin', 'user', 'test', 'demo', 'nutech', 'bus', 'track'];
  const lowerPassword = password.toLowerCase();
  for (const word of commonWords) {
    if (lowerPassword.includes(word)) {
      patterns.push(`Contains common word: "${word}"`);
      break;
    }
  }

  return patterns;
}
