CREATE TABLE `card_key_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`card_key_id` int NOT NULL,
	`download_history_id` int NOT NULL,
	`quota_used` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `card_key_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `card_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key_value` varchar(255) NOT NULL,
	`type` enum('per_download','monthly') NOT NULL,
	`total_quota` int NOT NULL,
	`remaining_quota` int NOT NULL,
	`expires_at` bigint,
	`status` enum('active','used','expired','invalid') NOT NULL DEFAULT 'active',
	`xiling_config_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `card_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `card_keys_key_value_unique` UNIQUE(`key_value`)
);
--> statement-breakpoint
CREATE TABLE `download_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`material_url` text NOT NULL,
	`card_key_id` int NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`download_link` text,
	`error_message` text,
	`processing_time` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `download_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `xiling_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_encrypted` text NOT NULL,
	`status` enum('active','inactive','error') NOT NULL DEFAULT 'active',
	`last_verified_at` timestamp,
	`last_error` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `xiling_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `xiling_config_email_unique` UNIQUE(`email`)
);
