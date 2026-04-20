-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SINGLE', 'DOUBLE', 'SUITE', 'DELUXE') NOT NULL,
    `price` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    `maxGuests` INTEGER NOT NULL DEFAULT 2,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `checkInDate` DATETIME(3) NOT NULL,
    `checkOutDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Cart_userId_idx`(`userId`),
    INDEX `Cart_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `checkInDate` DATETIME(3) NOT NULL,
    `checkOutDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `totalAmount` DOUBLE NOT NULL,
    `customerNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Booking_userId_idx`(`userId`),
    INDEX `Booking_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `priceAtBooking` DOUBLE NOT NULL,

    INDEX `BookingDetail_bookingId_idx`(`bookingId`),
    INDEX `BookingDetail_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingDetail` ADD CONSTRAINT `BookingDetail_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingDetail` ADD CONSTRAINT `BookingDetail_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
