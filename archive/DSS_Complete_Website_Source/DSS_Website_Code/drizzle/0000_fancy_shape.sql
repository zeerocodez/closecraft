CREATE TABLE `affiliates` (
	`user_id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`channel` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `affiliates_code_unique` ON `affiliates` (`code`);--> statement-breakpoint
CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate` text NOT NULL,
	`visitor` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`goal` text NOT NULL,
	`referral` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payout_claims` (
	`sale_id` text PRIMARY KEY NOT NULL,
	`payout_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate` text NOT NULL,
	`amount` integer NOT NULL,
	`reference` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payouts_reference_unique` ON `payouts` (`reference`);--> statement-breakpoint
CREATE TABLE `programme` (
	`id` text PRIMARY KEY NOT NULL,
	`selar` text DEFAULT '' NOT NULL,
	`nestuge` text DEFAULT '' NOT NULL,
	`price` integer,
	`rate` integer DEFAULT 0 NOT NULL,
	`hold_days` integer DEFAULT 30 NOT NULL,
	`minimum` integer DEFAULT 1000000 NOT NULL,
	`live` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate` text NOT NULL,
	`reference` text NOT NULL,
	`platform` text NOT NULL,
	`amount` integer NOT NULL,
	`commission` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`eligible` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_reference_unique` ON `sales` (`reference`);