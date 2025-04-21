CREATE TABLE "coach_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL,
	"read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" uuid NOT NULL,
	"message" text NOT NULL,
	"country" text,
	"state" text,
	"city" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL,
	"read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "player_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL,
	"read" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "coach_notifications" ADD CONSTRAINT "coach_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_notifications" ADD CONSTRAINT "organization_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_notifications" ADD CONSTRAINT "player_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;