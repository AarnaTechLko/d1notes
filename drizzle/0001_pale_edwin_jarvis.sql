CREATE TABLE IF NOT EXISTS "coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" varchar,
	"lastName" varchar,
	"email" varchar,
	"phoneNumber" varchar,
	"gender" varchar,
	"location" varchar,
	"sport" varchar,
	"clubName" varchar,
	"qualifications" text,
	"expectedCharge" numeric(10, 2),
	"image" text,
	"slug" text,
	"country" varchar,
	"state" varchar,
	"city" varchar,
	"rating" integer DEFAULT 0,
	"password" text NOT NULL,
	"certificate" text,
	"countrycode" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evaluation_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"coachId" integer NOT NULL,
	"evaluation_id" integer NOT NULL,
	"finalRemarks" text,
	"physicalRemarks" text,
	"tacticalRemarks" text,
	"technicalRemarks" text,
	"physicalScores" text NOT NULL,
	"tacticalScores" text NOT NULL,
	"technicalScores" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"coach_id" integer NOT NULL,
	"evaluation_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar,
	"payment_info" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_evaluation" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"coach_id" integer NOT NULL,
	"review_title" varchar NOT NULL,
	"primary_video_link" text NOT NULL,
	"video_link_two" text,
	"video_link_three" text,
	"video_description" text NOT NULL,
	"status" integer NOT NULL,
	"turnaroundTime" varchar,
	"payment_status" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"rating" integer,
	"remarks" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_token" text NOT NULL,
	"user_id" serial NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "unique_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "image" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_name" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "grade_level" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birthday" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sport" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "team" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "jersey" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "number" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "state" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "league" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "countrycode" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coaches_unique_idx" ON "coaches" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payments_unique_idx" ON "payments" ("player_id","coach_id","evaluation_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_unique_idx" ON "users" ("email");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");