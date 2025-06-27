CREATE TABLE "admin_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer DEFAULT 1,
	"receiver_id" integer NOT NULL,
	"message" text NOT NULL,
	"status" integer DEFAULT 1,
	"read" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "coachearnings" ADD COLUMN "is_deleted" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "review_status" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "is_deleted" integer DEFAULT 1 NOT NULL;