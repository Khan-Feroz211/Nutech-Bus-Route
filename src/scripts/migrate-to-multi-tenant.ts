import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function migrateToMultiTenant() {
  console.log('Starting multi-tenant migration...');

  // Create default organization for NUTECH
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: 'nutech' },
    update: {},
    create: {
      name: 'NUTECH University',
      slug: 'nutech',
      primaryColor: '#1B3A6B',
      secondaryColor: '#3B82F6',
      plan: 'enterprise',
      maxUsers: 1000,
      maxVehicles: 50,
      features: JSON.stringify({
        fuelManagement: true,
        routeDeviation: true,
        drivingBehavior: true,
        qrScanning: true,
        pushNotifications: true,
        advancedAnalytics: true,
      }),
      settings: JSON.stringify({
        timezone: 'Asia/Karachi',
        language: 'en',
      }),
    },
  });

  console.log('Default organization created:', defaultOrg.name);

  // Migrate existing users to default organization
  const users = await prisma.user.findMany();
  console.log(`Migrating ${users.length} users...`);

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: defaultOrg.id },
    });
  }

  // Migrate existing routes to default organization
  const routes = await prisma.busRoute.findMany();
  console.log(`Migrating ${routes.length} routes...`);

  for (const route of routes) {
    await prisma.busRoute.update({
      where: { id: route.id },
      data: { organizationId: defaultOrg.id },
    });
  }

  // Migrate existing buses to default organization
  const buses = await prisma.bus.findMany();
  console.log(`Migrating ${buses.length} buses...`);

  for (const bus of buses) {
    await prisma.bus.update({
      where: { id: bus.id },
      data: { organizationId: defaultOrg.id },
    });
  }

  // Migrate existing trips to default organization
  const trips = await prisma.trip.findMany();
  console.log(`Migrating ${trips.length} trips...`);

  for (const trip of trips) {
    await prisma.trip.update({
      where: { id: trip.id },
      data: { organizationId: defaultOrg.id },
    });
  }

  console.log('Migration completed successfully!');
}

migrateToMultiTenant()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
