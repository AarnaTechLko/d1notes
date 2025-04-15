ALTER TABLE "coaches" ADD COLUMN "isCompletedProfile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "blockedPlayerIds" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "blockedCoachIds" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isCompletedProfile" boolean DEFAULT false;