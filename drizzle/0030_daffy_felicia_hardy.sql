ALTER TABLE "coaches" ADD COLUMN "is_deleted" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "is_deleted" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "is_deleted" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "is_deleted" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_deleted" integer DEFAULT 1 NOT NULL;