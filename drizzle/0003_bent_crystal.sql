CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "coach_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "player_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "sender_id";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "sender_type";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "receiver_id";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "receiver_type";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "message";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "createdAt";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN IF EXISTS "club_id";