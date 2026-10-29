-- BillingEvent: generalize the Stripe-only event id so Razorpay events share
-- the table. The column is renamed, not dropped, so existing Stripe event ids
-- keep deduplicating redeliveries.
DROP INDEX `BillingEvent_stripeEventId_key` ON `BillingEvent`;
ALTER TABLE `BillingEvent` RENAME COLUMN `stripeEventId` TO `eventId`;
ALTER TABLE `BillingEvent` ADD COLUMN `provider` ENUM('STRIPE', 'RAZORPAY') NOT NULL DEFAULT 'STRIPE';
CREATE UNIQUE INDEX `BillingEvent_provider_eventId_key` ON `BillingEvent`(`provider`, `eventId`);

-- Workspace: which provider owns the subscription, plus Razorpay ids.
ALTER TABLE `Workspace` ADD COLUMN `billingProvider` ENUM('STRIPE', 'RAZORPAY') NOT NULL DEFAULT 'STRIPE',
    ADD COLUMN `razorpayCustomerId` VARCHAR(191) NULL,
    ADD COLUMN `razorpayPlanId` VARCHAR(191) NULL,
    ADD COLUMN `razorpaySubscriptionId` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `Workspace_razorpaySubscriptionId_key` ON `Workspace`(`razorpaySubscriptionId`);
