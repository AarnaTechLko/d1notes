ALTER TABLE "teams" ADD COLUMN "suspend" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "suspend_days" integer;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "suspend_start_date" date;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "suspend_end_date" date;