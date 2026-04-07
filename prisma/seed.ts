/**
 * Prisma seed script — populates the SQLite database with initial data.
 * Run with:  npx tsx prisma/seed.ts
 */

import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';

const DB_PATH = `file:${path.resolve(process.cwd(), 'prisma', 'dev.db')}`;

const adapter = new PrismaLibSql({ url: DB_PATH });
const prisma = new PrismaClient({ adapter });

const ROUTES = [
  {
    id: 'route-a',
    name: 'Rawalpindi Route',
    label: 'Route A',
    color: '#1B3A6B',
    area: 'Rawalpindi',
    morningDeparture: '7:30 AM',
    eveningDeparture: '5:00 PM',
    estimatedDuration: '55 min',
    stopsJson: JSON.stringify([
      { id: 'ra-1', name: 'Rawalpindi Saddar', location: { lat: 33.5986, lng: 73.0478 }, order: 1, morningArrival: '7:30 AM', eveningArrival: '5:50 PM' },
      { id: 'ra-2', name: 'Faizabad',          location: { lat: 33.6060, lng: 73.0566 }, order: 2, morningArrival: '7:40 AM', eveningArrival: '5:40 PM' },
      { id: 'ra-3', name: 'Peshawar Mor',      location: { lat: 33.6232, lng: 73.0682 }, order: 3, morningArrival: '7:48 AM', eveningArrival: '5:30 PM' },
      { id: 'ra-4', name: 'Koral Chowk',       location: { lat: 33.6340, lng: 73.0890 }, order: 4, morningArrival: '7:56 AM', eveningArrival: '5:22 PM' },
      { id: 'ra-5', name: 'NUTECH Gate',        location: { lat: 33.6480, lng: 73.1150 }, order: 5, morningArrival: '8:10 AM', eveningArrival: '5:10 PM' },
      { id: 'ra-6', name: 'NUTECH Campus',      location: { lat: 33.6502, lng: 73.1201 }, order: 6, morningArrival: '8:25 AM', eveningArrival: '5:00 PM' },
    ]),
    waypointsJson: JSON.stringify([
      { lat: 33.5986, lng: 73.0478 }, { lat: 33.6020, lng: 73.0510 }, { lat: 33.6060, lng: 73.0566 },
      { lat: 33.6150, lng: 73.0620 }, { lat: 33.6232, lng: 73.0682 }, { lat: 33.6290, lng: 73.0780 },
      { lat: 33.6340, lng: 73.0890 }, { lat: 33.6410, lng: 73.1010 }, { lat: 33.6480, lng: 73.1150 },
      { lat: 33.6502, lng: 73.1201 },
    ]),
  },
  {
    id: 'route-b',
    name: 'G-11 / G-10 Route',
    label: 'Route B',
    color: '#16A34A',
    area: 'G-11',
    morningDeparture: '7:45 AM',
    eveningDeparture: '5:00 PM',
    estimatedDuration: '40 min',
    stopsJson: JSON.stringify([
      { id: 'rb-1', name: 'G-11 Markaz',   location: { lat: 33.6847, lng: 73.0051 }, order: 1, morningArrival: '7:45 AM', eveningArrival: '5:45 PM' },
      { id: 'rb-2', name: 'G-10 Markaz',   location: { lat: 33.6800, lng: 73.0200 }, order: 2, morningArrival: '7:52 AM', eveningArrival: '5:38 PM' },
      { id: 'rb-3', name: 'Golra Mor',      location: { lat: 33.6700, lng: 73.0450 }, order: 3, morningArrival: '8:00 AM', eveningArrival: '5:28 PM' },
      { id: 'rb-4', name: 'Tarlai',         location: { lat: 33.6580, lng: 73.0820 }, order: 4, morningArrival: '8:12 AM', eveningArrival: '5:16 PM' },
      { id: 'rb-5', name: 'NUTECH Campus', location: { lat: 33.6502, lng: 73.1201 }, order: 5, morningArrival: '8:25 AM', eveningArrival: '5:00 PM' },
    ]),
    waypointsJson: JSON.stringify([
      { lat: 33.6847, lng: 73.0051 }, { lat: 33.6820, lng: 73.0130 }, { lat: 33.6800, lng: 73.0200 },
      { lat: 33.6760, lng: 73.0320 }, { lat: 33.6700, lng: 73.0450 }, { lat: 33.6640, lng: 73.0630 },
      { lat: 33.6580, lng: 73.0820 }, { lat: 33.6540, lng: 73.1010 }, { lat: 33.6502, lng: 73.1201 },
    ]),
  },
  {
    id: 'route-c',
    name: 'Bahria Town Route',
    label: 'Route C',
    color: '#DC2626',
    area: 'Bahria Town',
    morningDeparture: '7:15 AM',
    eveningDeparture: '5:00 PM',
    estimatedDuration: '65 min',
    stopsJson: JSON.stringify([
      { id: 'rc-1', name: 'Bahria Town Phase 4', location: { lat: 33.5231, lng: 73.1234 }, order: 1, morningArrival: '7:15 AM', eveningArrival: '6:00 PM' },
      { id: 'rc-2', name: 'DHA Phase 2',         location: { lat: 33.5410, lng: 73.1180 }, order: 2, morningArrival: '7:28 AM', eveningArrival: '5:48 PM' },
      { id: 'rc-3', name: 'Giga Mall',            location: { lat: 33.5600, lng: 73.1100 }, order: 3, morningArrival: '7:40 AM', eveningArrival: '5:35 PM' },
      { id: 'rc-4', name: 'PWD Colony',           location: { lat: 33.5900, lng: 73.1150 }, order: 4, morningArrival: '7:55 AM', eveningArrival: '5:20 PM' },
      { id: 'rc-5', name: 'NUTECH Campus',        location: { lat: 33.6502, lng: 73.1201 }, order: 5, morningArrival: '8:20 AM', eveningArrival: '5:00 PM' },
    ]),
    waypointsJson: JSON.stringify([
      { lat: 33.5231, lng: 73.1234 }, { lat: 33.5320, lng: 73.1210 }, { lat: 33.5410, lng: 73.1180 },
      { lat: 33.5510, lng: 73.1150 }, { lat: 33.5600, lng: 73.1100 }, { lat: 33.5720, lng: 73.1130 },
      { lat: 33.5900, lng: 73.1150 }, { lat: 33.6200, lng: 73.1170 }, { lat: 33.6502, lng: 73.1201 },
    ]),
  },
  {
    id: 'route-d',
    name: 'F-10 / F-11 Route',
    label: 'Route D',
    color: '#9333EA',
    area: 'F-10',
    morningDeparture: '7:30 AM',
    eveningDeparture: '5:00 PM',
    estimatedDuration: '50 min',
    stopsJson: JSON.stringify([
      { id: 'rd-1', name: 'F-10 Markaz',       location: { lat: 33.7010, lng: 73.0190 }, order: 1, morningArrival: '7:30 AM', eveningArrival: '5:50 PM' },
      { id: 'rd-2', name: 'F-11 Markaz',       location: { lat: 33.7100, lng: 73.0100 }, order: 2, morningArrival: '7:38 AM', eveningArrival: '5:42 PM' },
      { id: 'rd-3', name: 'Khayaban-e-Iqbal', location: { lat: 33.6920, lng: 73.0340 }, order: 3, morningArrival: '7:48 AM', eveningArrival: '5:30 PM' },
      { id: 'rd-4', name: 'Zero Point',        location: { lat: 33.6800, lng: 73.0500 }, order: 4, morningArrival: '7:58 AM', eveningArrival: '5:18 PM' },
      { id: 'rd-5', name: 'NUTECH Campus',     location: { lat: 33.6502, lng: 73.1201 }, order: 5, morningArrival: '8:20 AM', eveningArrival: '5:00 PM' },
    ]),
    waypointsJson: JSON.stringify([
      { lat: 33.7010, lng: 73.0190 }, { lat: 33.7060, lng: 73.0150 }, { lat: 33.7100, lng: 73.0100 },
      { lat: 33.7010, lng: 73.0220 }, { lat: 33.6920, lng: 73.0340 }, { lat: 33.6860, lng: 73.0420 },
      { lat: 33.6800, lng: 73.0500 }, { lat: 33.6680, lng: 73.0820 }, { lat: 33.6502, lng: 73.1201 },
    ]),
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert routes
  for (const route of ROUTES) {
    await prisma.busRoute.upsert({
      where: { id: route.id },
      update: route,
      create: route,
    });
  }
  console.log('✅ Routes seeded');

  // Upsert buses
  const buses = [
    { id: 'bus-001', plateNumber: 'ISB-001', routeId: 'route-a', driverId: 'drv-001', capacity: 45, model: 'Hino Coach 2022', status: 'active', currentLat: 33.6232, currentLng: 73.0682, heading: 45, speed: 35 },
    { id: 'bus-002', plateNumber: 'ISB-002', routeId: 'route-b', driverId: 'drv-002', capacity: 40, model: 'Yutong 2021',     status: 'active', currentLat: 33.6700, currentLng: 73.0450, heading: 120, speed: 28 },
    { id: 'bus-003', plateNumber: 'ISB-003', routeId: 'route-c', driverId: 'drv-003', capacity: 45, model: 'Hino Coach 2023', status: 'idle',   currentLat: 33.5600, currentLng: 73.1100, heading: 0,   speed: 0  },
    { id: 'bus-004', plateNumber: 'ISB-004', routeId: 'route-d', driverId: 'drv-004', capacity: 40, model: 'King Long 2022',  status: 'active', currentLat: 33.6920, currentLng: 73.0340, heading: 200, speed: 32 },
  ];
  for (const bus of buses) {
    await prisma.bus.upsert({ where: { id: bus.id }, update: bus, create: bus });
  }
  console.log('✅ Buses seeded');

  // Hash passwords
  const studentHash = await bcrypt.hash('student123', 10);
  const driverHash  = await bcrypt.hash('1234', 10);
  const adminHash   = await bcrypt.hash('admin123', 10);

  // Upsert students
  const students = [
    { id: 'stu-001', name: 'Ali Hassan',   role: 'student', rollNumber: 'NUTECH-2023-001', assignedRouteId: 'route-a', email: 'ali@nutech.edu.pk',    phoneNumber: '+92-300-1234567', address: 'Rawalpindi Saddar', passwordHash: studentHash },
    { id: 'stu-002', name: 'Fatima Khan',  role: 'student', rollNumber: 'NUTECH-2023-002', assignedRouteId: 'route-b', email: 'fatima@nutech.edu.pk', phoneNumber: '+92-301-2345678', address: 'G-11 Markaz',      passwordHash: studentHash },
    { id: 'stu-003', name: 'Ahmed Raza',   role: 'student', rollNumber: 'NUTECH-2023-003', assignedRouteId: 'route-c', email: 'ahmed@nutech.edu.pk',  phoneNumber: '+92-302-3456789', address: 'Bahria Town Ph4',  passwordHash: studentHash },
    { id: 'stu-004', name: 'Sara Malik',   role: 'student', rollNumber: 'NUTECH-2023-004', assignedRouteId: 'route-d', email: 'sara@nutech.edu.pk',   phoneNumber: '+92-303-4567890', address: 'F-10 Markaz',      passwordHash: studentHash },
    { id: 'stu-005', name: 'Usman Tariq',  role: 'student', rollNumber: 'NUTECH-2023-005', assignedRouteId: 'route-a', email: 'usman@nutech.edu.pk',  phoneNumber: '+92-304-5678901', address: 'Faizabad',         passwordHash: studentHash },
    { id: 'stu-006', name: 'Ayesha Noor',  role: 'student', rollNumber: 'NUTECH-2023-006', assignedRouteId: 'route-b', email: 'ayesha@nutech.edu.pk', phoneNumber: '+92-305-6789012', address: 'G-10 Markaz',      passwordHash: studentHash },
  ];
  for (const s of students) {
    await prisma.user.upsert({ where: { id: s.id }, update: s, create: s });
  }
  console.log('✅ Students seeded');

  // Upsert drivers
  const drivers = [
    { id: 'drv-001', name: 'Muhammad Asif',  role: 'driver', employeeId: 'DRV-001', assignedBusId: 'bus-001', phoneNumber: '+92-333-1111111', licenseNumber: 'LHR-2019-12345', passwordHash: driverHash },
    { id: 'drv-002', name: 'Khalid Mehmood', role: 'driver', employeeId: 'DRV-002', assignedBusId: 'bus-002', phoneNumber: '+92-333-2222222', licenseNumber: 'ISB-2018-67890', passwordHash: driverHash },
    { id: 'drv-003', name: 'Tariq Iqbal',    role: 'driver', employeeId: 'DRV-003', assignedBusId: 'bus-003', phoneNumber: '+92-333-3333333', licenseNumber: 'RWP-2020-11111', passwordHash: driverHash },
    { id: 'drv-004', name: 'Imran Shahid',   role: 'driver', employeeId: 'DRV-004', assignedBusId: 'bus-004', phoneNumber: '+92-333-4444444', licenseNumber: 'ISB-2021-22222', passwordHash: driverHash },
  ];
  for (const d of drivers) {
    await prisma.user.upsert({ where: { id: d.id }, update: d, create: d });
  }
  console.log('✅ Drivers seeded');

  // Admin
  await prisma.user.upsert({
    where: { id: 'adm-001' },
    update: { passwordHash: adminHash },
    create: { id: 'adm-001', name: 'Admin NUTECH', role: 'admin', email: 'admin@nutech.edu.pk', passwordHash: adminHash },
  });
  console.log('✅ Admin seeded');

  // Seed notifications
  const notifs = [
    { id: 'notif-001', title: 'Bus Arriving Soon', message: 'Route A bus is 5 minutes away from Rawalpindi Saddar stop.', type: 'arrival', routeId: 'route-a', read: false },
    { id: 'notif-002', title: 'Slight Delay', message: 'Route B bus is delayed by approximately 10 minutes due to traffic at Golra Mor.', type: 'delay', routeId: 'route-b', read: false },
    { id: 'notif-003', title: 'System Announcement', message: 'Tomorrow (Friday) buses will run on a reduced schedule. Evening departure at 2:00 PM.', type: 'system', targetRole: 'all', read: false },
    { id: 'notif-004', title: 'Trip Started', message: 'Route A bus (ISB-001) has started its morning trip from Rawalpindi Saddar.', type: 'info', routeId: 'route-a', read: true },
  ];
  for (const n of notifs) {
    await prisma.notification.upsert({ where: { id: n.id }, update: n, create: n });
  }
  console.log('✅ Notifications seeded');

  // Seed sample bus pass applications
  await prisma.busPassApplication.upsert({
    where: { id: 'bp-001' },
    update: {},
    create: {
      id: 'bp-001',
      studentId: 'stu-001',
      routeId: 'route-a',
      semester: 'Spring 2025',
      status: 'approved',
      feeStatus: 'paid',
      feeAmount: 5000,
      validFrom: new Date('2025-01-15'),
      validTo: new Date('2025-06-30'),
    },
  });
  await prisma.busPassApplication.upsert({
    where: { id: 'bp-002' },
    update: {},
    create: {
      id: 'bp-002',
      studentId: 'stu-002',
      routeId: 'route-b',
      semester: 'Spring 2025',
      status: 'pending',
      feeStatus: 'unpaid',
      feeAmount: 5000,
    },
  });
  console.log('✅ Bus passes seeded');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
