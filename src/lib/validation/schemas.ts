import { z } from 'zod';

export const userRoles = ['student', 'driver', 'admin'] as const;
export type UserRole = typeof userRoles[number];

export const notificationTypes = ['info', 'warning', 'delay', 'arrival', 'system'] as const;
export type NotificationType = typeof notificationTypes[number];

export const reportTypes = ['driver', 'bus', 'route', 'other'] as const;
export type ReportType = typeof reportTypes[number];

export const busStatuses = ['idle', 'active', 'maintenance', 'retired'] as const;
export type BusStatus = typeof busStatuses[number];

export const tripStatuses = ['active', 'completed', 'cancelled'] as const;
export type TripStatus = typeof tripStatuses[number];

export const tripDirections = ['morning', 'evening'] as const;
export type TripDirection = typeof tripDirections[number];

export const busPassStatuses = ['pending', 'approved', 'rejected'] as const;
export type BusPassStatus = typeof busPassStatuses[number];

export const feeStatuses = ['unpaid', 'paid'] as const;
export type FeeStatus = typeof feeStatuses[number];

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerStudentSchema = z.object({
  studentId: z.string().regex(/^NUTECH-\d{4}-\d{3}$/, 'Invalid student ID format (e.g., NUTECH-2023-001)'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').refine(
    (email) => email.endsWith('@nutech.edu.pk'),
    { message: 'Email must be from nutech.edu.pk domain' }
  ),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  route: z.string().min(1, 'Route is required'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export const registerDriverSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  licenseNumber: z.string().min(5, 'License number is required'),
  licenseExpiry: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  phoneNumber: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const sendVerificationOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const createBusSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required').max(20),
  model: z.string().min(1, 'Model is required').max(50),
  capacity: z.number().int().min(10, 'Capacity must be at least 10').max(100),
  routeId: z.string().optional(),
});

export const updateBusSchema = z.object({
  id: z.string().min(1, 'Bus ID is required'),
  plateNumber: z.string().min(1).max(20).optional(),
  model: z.string().min(1).max(50).optional(),
  capacity: z.number().int().min(10).max(100).optional(),
  status: z.enum(busStatuses).optional(),
  routeId: z.string().optional(),
  driverId: z.string().optional(),
});

export const updateBusLocationSchema = z.object({
  id: z.string().min(1, 'Bus ID is required'),
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.number().min(-180).max(180, 'Invalid longitude'),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
});

export const createRouteSchema = z.object({
  name: z.string().min(1, 'Route name is required').max(50),
  label: z.string().length(1, 'Route label must be a single character'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)'),
  area: z.string().min(1, 'Area is required').max(100),
  morningDeparture: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (use HH:MM)'),
  eveningDeparture: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (use HH:MM)'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required').max(50),
  stopsJson: z.string().optional(),
  waypointsJson: z.string().optional(),
});

export const updateRouteSchema = z.object({
  id: z.string().min(1, 'Route ID is required'),
  name: z.string().min(1).max(50).optional(),
  label: z.string().length(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  area: z.string().min(1).max(100).optional(),
  morningDeparture: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  eveningDeparture: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  estimatedDuration: z.string().min(1).max(50).optional(),
  stopsJson: z.string().optional(),
  waypointsJson: z.string().optional(),
  active: z.boolean().optional(),
});

export const createTripSchema = z.object({
  busId: z.string().min(1, 'Bus ID is required'),
  driverId: z.string().min(1, 'Driver ID is required'),
  routeId: z.string().min(1, 'Route ID is required'),
  startTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  direction: z.enum(tripDirections),
});

export const updateTripSchema = z.object({
  id: z.string().min(1, 'Trip ID is required'),
  endTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
  status: z.enum(tripStatuses).optional(),
});

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(1000),
  type: z.enum(notificationTypes),
  targetRole: z.enum(['all', ...userRoles]).optional(),
  routeId: z.string().optional(),
});

export const updateNotificationSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
  read: z.boolean().optional(),
});

export const createReportSchema = z.object({
  type: z.enum(reportTypes),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  busId: z.string().optional(),
  routeId: z.string().optional(),
});

export const updateReportSchema = z.object({
  id: z.string().min(1, 'Report ID is required'),
  status: z.enum(['pending', 'resolved', 'dismissed']),
});

export const createBusPassApplicationSchema = z.object({
  routeId: z.string().min(1, 'Route ID is required'),
  semester: z.string().min(1, 'Semester is required').max(50),
  feeAmount: z.number().optional(),
});

export const updateBusPassApplicationSchema = z.object({
  id: z.string().min(1, 'Application ID is required'),
  status: z.enum(busPassStatuses).optional(),
  feeStatus: z.enum(feeStatuses).optional(),
  notes: z.string().max(500).optional(),
  validFrom: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
  validTo: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
});

export const createStudentSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  rollNumber: z.string().min(1).max(50),
  assignedRouteId: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export const updateStudentSchema = z.object({
  id: z.string().min(1, 'Student ID is required'),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  rollNumber: z.string().min(1).max(50).optional(),
  assignedRouteId: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
