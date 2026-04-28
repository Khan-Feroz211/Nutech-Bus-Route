-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rollNumber" TEXT,
    "assignedRouteId" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "employeeId" TEXT,
    "assignedBusId" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiry" DATETIME
);

-- CreateTable
CREATE TABLE "BusRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "morningDeparture" TEXT NOT NULL,
    "eveningDeparture" TEXT NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "stopsJson" TEXT NOT NULL,
    "waypointsJson" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plateNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "routeId" TEXT,
    "driverId" TEXT,
    "heading" REAL,
    "speed" REAL,
    "currentLat" REAL,
    "currentLng" REAL,
    "lastUpdated" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bus_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "BusRoute" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "busId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "direction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trip_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "BusRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetRole" TEXT,
    "routeId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "busId" TEXT,
    "routeId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusPassApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "feeStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "feeAmount" REAL NOT NULL DEFAULT 5000,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "notes" TEXT,
    CONSTRAINT "BusPassApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoardingLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "tripId" TEXT,
    "boardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoardingLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BoardingLog_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BoardingLog_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "BusRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BoardingLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_rollNumber_key" ON "User"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_plateNumber_key" ON "Bus"("plateNumber");
