CREATE TYPE "public"."rating_enum" AS ENUM('Neutral', 'Positive', 'Excellent');--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "persistence" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "aggression" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "alertness" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "scoring" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "receiving" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "passing" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "mobility" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "anticipation" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "pressure" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "speed_endurance" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "strength" SET DATA TYPE rating_enum;--> statement-breakpoint
ALTER TABLE "radar_evaluation" ALTER COLUMN "explosive_movements" SET DATA TYPE rating_enum;