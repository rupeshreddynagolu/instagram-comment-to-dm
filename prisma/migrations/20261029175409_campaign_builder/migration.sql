-- AlterTable
ALTER TABLE `Automation` ADD COLUMN `dmTriggerEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `followPromptButtonLabel` VARCHAR(191) NULL,
    ADD COLUMN `followPromptMessage` TEXT NULL,
    ADD COLUMN `followUpDelayMinutes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `followUpEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `followUpMessage` TEXT NULL,
    ADD COLUMN `linkButtonLabel` VARCHAR(191) NULL,
    ADD COLUMN `matchAnyPost` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `matchAnyWord` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `openingDmButtonLabel` VARCHAR(191) NULL,
    ADD COLUMN `openingDmEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `openingDmMessage` TEXT NULL,
    ADD COLUMN `pendingNextReel` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `publicReplyEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `publicReplyMessage` TEXT NULL,
    ADD COLUMN `publicReplyMessages` JSON NULL,
    ADD COLUMN `requireFollow` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `postId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `DmLog` ADD COLUMN `publicReplyError` TEXT NULL,
    ADD COLUMN `publicReplySentAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `ProcessedComment` (
    `id` VARCHAR(191) NOT NULL,
    `instagramAccountId` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `seenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProcessedComment_commentId_key`(`commentId`),
    INDEX `ProcessedComment_instagramAccountId_idx`(`instagramAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- publicReplyMessages is added as NULL, filled, then made NOT NULL. Adding a
-- NOT NULL JSON column straight onto a table with rows fails on MariaDB,
-- whose JSON is LONGTEXT with a json_valid() check that the empty filler
-- value does not pass. Existing campaigns get the same empty list a new
-- campaign gets.
UPDATE `Automation` SET `publicReplyMessages` = JSON_ARRAY() WHERE `publicReplyMessages` IS NULL;
ALTER TABLE `Automation` MODIFY `publicReplyMessages` JSON NOT NULL;
