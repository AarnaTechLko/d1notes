ALTER TABLE "enterprises" ADD COLUMN "suspend_start_date" date;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "suspend_end_date" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspend_start_date" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspend_end_date" date;