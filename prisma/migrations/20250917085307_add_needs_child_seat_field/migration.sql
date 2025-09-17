/*
  Warnings:

  - The values [ASSIGNED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."bookings" ALTER COLUMN "status" TYPE "public"."BookingStatus_new" USING ("status"::text::"public"."BookingStatus_new");
ALTER TYPE "public"."BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "public"."BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "public"."bookings" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "needsChildSeat" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."pricing_config" (
    "id" TEXT NOT NULL,
    "baseFare" DOUBLE PRECISION NOT NULL DEFAULT 2.50,
    "pricePerKm" DOUBLE PRECISION NOT NULL DEFAULT 1.00,
    "extraLuggageFee" DOUBLE PRECISION NOT NULL DEFAULT 10.00,
    "largeGroupSurcharge" DOUBLE PRECISION NOT NULL DEFAULT 5.00,
    "accessibleVehicleFee" DOUBLE PRECISION NOT NULL DEFAULT 2.00,
    "childSeatFee" DOUBLE PRECISION NOT NULL DEFAULT 3.00,
    "nightSurcharge" DOUBLE PRECISION NOT NULL DEFAULT 10.00,
    "minimumFare" DOUBLE PRECISION NOT NULL DEFAULT 5.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_config_pkey" PRIMARY KEY ("id")
);
