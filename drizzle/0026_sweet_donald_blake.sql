DROP TABLE "coach_notifications" CASCADE;--> statement-breakpoint
DROP TABLE "notifications" CASCADE;--> statement-breakpoint
DROP TABLE "organization_notifications" CASCADE;--> statement-breakpoint
DROP TABLE "player_notifications" CASCADE;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "speed" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "ability" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "cod_with_ball" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "cod_without_ball" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "counter_move_jump" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "receiving_first_touch" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "shots_on_goal" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "finishing_touches" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "combination_play" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "workrate" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "pressing_from_front" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "one_v_one_domination" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "goal_threat" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "being_a_good_teammate" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "decision_making_score" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "touches_in_final_third" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "off_the_ball_movement" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "space_in_box_ability" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "forward_runs" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "persistence" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "aggression" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "alertness" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "scoring" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "receiving" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "passing" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "mobility" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "anticipation" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "pressure" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "speed_endurance" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "strength" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "explosive_movements" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "super_strengths" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "development_areas" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "idp_goals" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "key_skills" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "attacking" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "defending" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "transition_defending" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "transition_attacking" text;