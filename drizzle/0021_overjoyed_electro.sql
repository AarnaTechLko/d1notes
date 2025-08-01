CREATE TABLE "radar_evaluation" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"coachId" integer NOT NULL,
	"club_id" integer,
	"evaluation_id" integer NOT NULL,
	"speed" integer,
	"ability" integer,
	"cod_with_ball" integer,
	"cod_without_ball" integer,
	"counter_move_jump" integer,
	"receiving_first_touch" integer,
	"shots_on_goal" integer,
	"finishing_touches" integer,
	"combination_play" integer,
	"workrate" integer,
	"pressing_from_front" integer,
	"one_v_one_domination" integer,
	"goal_threat" integer,
	"being_a_good_teammate" integer,
	"decision_making_score" integer,
	"touches_in_final_third" integer,
	"off_the_ball_movement" integer,
	"space_in_box_ability" integer,
	"forward_runs" integer,
	"persistence" text,
	"aggression" text,
	"alertness" text,
	"scoring" text,
	"receiving" text,
	"passing" text,
	"mobility" text,
	"anticipation" text,
	"pressure" text,
	"speed_endurance" text,
	"strength" text,
	"explosive_movements" text,
	"super_strengths" text,
	"development_areas" text,
	"idp_goals" text,
	"key_skills" text,
	"attacking" text,
	"defending" text,
	"transition_defending" text,
	"transition_attacking" text
);
