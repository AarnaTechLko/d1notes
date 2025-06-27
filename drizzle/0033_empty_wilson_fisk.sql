ALTER TABLE "coaches" ADD COLUMN "suspend" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "suspend_days" integer;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "suspend" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "suspend_days" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspend" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspend_days" integer;