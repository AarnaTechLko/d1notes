ALTER TABLE "ip_logs" ALTER COLUMN "login_time" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ip_logs" ALTER COLUMN "login_time" DROP NOT NULL;