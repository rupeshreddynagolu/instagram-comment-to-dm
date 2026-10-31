-- AlterTable
ALTER TABLE `User` ADD COLUMN `passwordHash` TEXT NULL;

-- AlterTable
ALTER TABLE `Session` ADD COLUMN `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `viaPassword` BOOLEAN NOT NULL DEFAULT false;

-- Sessions that existed before this column didn't start just now.
UPDATE `Session` SET `createdAt` = NULL;
