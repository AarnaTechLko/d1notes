ALTER TABLE "suspendlog" ADD COLUMN "type" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "suspendlog" DROP COLUMN "suspend_days";