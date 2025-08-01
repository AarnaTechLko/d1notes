ALTER TABLE "ip_logs" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "ip_logs" ADD COLUMN "region" varchar(100);--> statement-breakpoint
ALTER TABLE "ip_logs" ADD COLUMN "country" varchar(5);--> statement-breakpoint
ALTER TABLE "ip_logs" ADD COLUMN "postal" varchar(20);--> statement-breakpoint
ALTER TABLE "ip_logs" ADD COLUMN "org" varchar(255);--> statement-breakpoint
ALTER TABLE "ip_logs" ADD COLUMN "loc" varchar(50);--> statement-breakpoint
ALTER TABLE "ip_logs" ADD COLUMN "timezone" varchar(100);