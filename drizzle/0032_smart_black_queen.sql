ALTER TABLE "admin" ALTER COLUMN "is_deleted" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "admin" ALTER COLUMN "is_deleted" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "admin" ALTER COLUMN "is_deleted" SET NOT NULL;