ALTER TABLE "ip_logs" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ip_logs" ALTER COLUMN "type" DROP NOT NULL;