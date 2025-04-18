ALTER TABLE "radar_evaluation" ALTER COLUMN "persistence" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "aggression" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "alertness" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "scoring" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "receiving" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "passing" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "mobility" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "anticipation" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "pressure" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "speed_endurance" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "strength" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "explosive_movements" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."rating_enum";