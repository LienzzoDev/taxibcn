/*
  Warnings:

  - You are about to drop the `drivers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rides` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."drivers" DROP CONSTRAINT "drivers_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."rides" DROP CONSTRAINT "rides_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."rides" DROP CONSTRAINT "rides_passengerId_fkey";

-- DropTable
DROP TABLE "public"."drivers";

-- DropTable
DROP TABLE "public"."rides";

-- DropTable
DROP TABLE "public"."users";

-- DropEnum
DROP TYPE "public"."RideStatus";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupLatitude" DOUBLE PRECISION,
    "pickupLongitude" DOUBLE PRECISION,
    "destinationAddress" TEXT NOT NULL,
    "destinationLatitude" DOUBLE PRECISION,
    "destinationLongitude" DOUBLE PRECISION,
    "passengers" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "hasLuggage" BOOLEAN NOT NULL DEFAULT false,
    "luggageCount" INTEGER,
    "timing" TEXT NOT NULL,
    "scheduledDate" TEXT,
    "scheduledTime" TEXT,
    "isAirport" BOOLEAN NOT NULL DEFAULT false,
    "flightNumber" TEXT,
    "isPort" BOOLEAN NOT NULL DEFAULT false,
    "portInfo" TEXT,
    "hasObservations" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentId" TEXT,
    "distance" DOUBLE PRECISION,
    "duration" INTEGER,
    "baseFare" DOUBLE PRECISION NOT NULL,
    "distanceFare" DOUBLE PRECISION NOT NULL,
    "surcharges" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);
