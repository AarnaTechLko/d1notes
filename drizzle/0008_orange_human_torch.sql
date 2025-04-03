ALTER TABLE "ticket" ALTER COLUMN "assign_to" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "assign_to" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "assign_to" SET NOT NULL;