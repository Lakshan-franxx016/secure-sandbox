CREATE TABLE `labs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`level` text NOT NULL,
	`tag` text NOT NULL,
	`steps` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`estimated_minutes` integer,
	`objectives` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `labs_slug_unique` ON `labs` (`slug`);