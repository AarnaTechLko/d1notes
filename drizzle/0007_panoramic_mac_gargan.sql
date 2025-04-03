ALTER TABLE "ticket" ALTER COLUMN "assign_to" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "assign_to" DROP NOT NULL;