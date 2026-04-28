import { describe, it, expect } from 'vitest';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      const mockCn = (...classes: (string | undefined | null | false)[]) => 
        classes.filter(Boolean).join(' ');
      
      expect(mockCn('foo', 'bar')).toBe('foo bar');
      expect(mockCn('foo', undefined, 'bar')).toBe('foo bar');
      expect(mockCn(null, false, 'bar')).toBe('bar');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const formatDate = (date: Date) => 
        new Intl.DateTimeFormat('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }).format(date);
      
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });
  });
});

describe('Validation', () => {
  describe('Email validation', () => {
    const isValidEmail = (email: string) => 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user@nutech.edu.pk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('Password validation', () => {
    const validatePassword = (password: string) => {
      const errors: string[] = [];
      if (password.length < 8) errors.push('At least 8 characters');
      if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
      if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
      if (!/[0-9]/.test(password)) errors.push('One number');
      return { valid: errors.length === 0, errors };
    };

    it('should validate strong password', () => {
      const result = validatePassword('SecurePass123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('weak').valid).toBe(false);
      expect(validatePassword('nouppercase123').valid).toBe(false);
      expect(validatePassword('NOLOWERCASE123').valid).toBe(false);
    });
  });

  describe('Student ID validation', () => {
    const isValidStudentId = (id: string) => 
      /^NUTECH-\d{4}-\d{3}$/.test(id);

    it('should validate student ID format', () => {
      expect(isValidStudentId('NUTECH-2023-001')).toBe(true);
      expect(isValidStudentId('NUTECH-2024-999')).toBe(true);
    });

    it('should reject invalid student ID', () => {
      expect(isValidStudentId('INVALID')).toBe(false);
      expect(isValidStudentId('NUTECH-23-001')).toBe(false);
      expect(isValidStudentId('NUTECH-2023-01')).toBe(false);
    });
  });
});

describe('Auth Utilities', () => {
  describe('Role checking', () => {
    type UserRole = 'student' | 'driver' | 'admin';
    
    const hasPermission = (userRole: UserRole, action: string) => {
      const permissions: Record<UserRole, string[]> = {
        student: ['view-schedule', 'track-bus', 'view-notifications'],
        driver: ['update-location', 'start-trip', 'end-trip'],
        admin: ['manage-students', 'manage-routes', 'manage-buses', 'view-analytics'],
      };
      return permissions[userRole]?.includes(action) ?? false;
    };

    it('should check student permissions', () => {
      expect(hasPermission('student', 'view-schedule')).toBe(true);
      expect(hasPermission('student', 'manage-buses')).toBe(false);
    });

    it('should check driver permissions', () => {
      expect(hasPermission('driver', 'update-location')).toBe(true);
      expect(hasPermission('driver', 'view-analytics')).toBe(false);
    });

    it('should check admin permissions', () => {
      expect(hasPermission('admin', 'manage-students')).toBe(true);
      expect(hasPermission('admin', 'view-schedule')).toBe(false);
    });
  });
});

describe('Bus Route Logic', () => {
  describe('ETA Calculation', () => {
    const calculateETA = (
      distanceKm: number,
      avgSpeedKmh: number
    ): number => {
      if (avgSpeedKmh <= 0) return 0;
      return Math.round((distanceKm / avgSpeedKmh) * 60);
    };

    it('should calculate ETA in minutes', () => {
      expect(calculateETA(10, 60)).toBe(10);
      expect(calculateETA(30, 60)).toBe(30);
      expect(calculateETA(15, 45)).toBe(20);
    });

    it('should handle zero speed', () => {
      expect(calculateETA(10, 0)).toBe(0);
    });
  });

  describe('Route Status', () => {
    type RouteStatus = 'active' | 'inactive' | 'delayed';
    
    const getRouteStatus = (
      isActive: boolean,
      delayMinutes: number
    ): RouteStatus => {
      if (!isActive) return 'inactive';
      if (delayMinutes > 15) return 'delayed';
      return 'active';
    };

    it('should return correct route status', () => {
      expect(getRouteStatus(true, 0)).toBe('active');
      expect(getRouteStatus(true, 20)).toBe('delayed');
      expect(getRouteStatus(false, 0)).toBe('inactive');
    });
  });
});
