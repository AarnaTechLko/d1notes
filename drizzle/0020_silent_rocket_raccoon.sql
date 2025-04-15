ALTER TABLE "coaches" ADD COLUMN "isCompletedProfile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "blockedCoachIds" text;