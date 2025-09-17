-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "needsReturnTrip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "returnDate" TEXT,
ADD COLUMN     "returnTime" TEXT;
