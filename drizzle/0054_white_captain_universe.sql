ALTER TABLE "role" ALTER COLUMN "role" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "change_password" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "change_password" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "refund" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "refund" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "monitor_activity" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "monitor_activity" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "view_finance" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "view_finance" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "access_ticket" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "access_ticket" SET DEFAULT 0;