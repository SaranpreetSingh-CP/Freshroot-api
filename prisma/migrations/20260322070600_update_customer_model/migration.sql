/*
  Warnings:

  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - The `id` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `addressId` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `actualPrice` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveredBasket` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveredQty` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offerPrice` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `package` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTerms` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendingKgs` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDeliveries` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuantity` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `customerId` on the `KitchenGarden` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `customerId` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `customerId` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_addressId_fkey";

-- DropForeignKey
ALTER TABLE "KitchenGarden" DROP CONSTRAINT "KitchenGarden_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_customerId_fkey";

-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "Customer_phone_key";

-- AlterTable
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_pkey",
DROP COLUMN "email",
DROP COLUMN "updatedAt",
ADD COLUMN     "actualPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "deliveredBasket" INTEGER NOT NULL,
ADD COLUMN     "deliveredQty" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "nextRenewal" TIMESTAMP(3),
ADD COLUMN     "offerPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "package" TEXT NOT NULL,
ADD COLUMN     "paymentTerms" TEXT NOT NULL,
ADD COLUMN     "pendingKgs" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "product" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "totalDeliveries" INTEGER NOT NULL,
ADD COLUMN     "totalQuantity" DOUBLE PRECISION NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Customer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "addressId";

-- AlterTable
ALTER TABLE "KitchenGarden" DROP COLUMN "customerId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "customerId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "Subscription";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenGarden" ADD CONSTRAINT "KitchenGarden_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
