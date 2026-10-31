-- AlterTable
ALTER TABLE `User` ADD COLUMN `passwordHash` TEXT NULL,
    ADD COLUMN `lastLinkSignInAt` DATETIME(3) NULL;
