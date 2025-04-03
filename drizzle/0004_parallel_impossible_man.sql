CREATE TABLE "coachaccount" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coachearnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer,
	"evaluation_id" integer NOT NULL,
	"evaluation_title" varchar,
	"player_id" integer,
	"company_amount" numeric,
	"commision_rate" numeric,
	"commision_amount" numeric,
	"transaction_id" varchar,
	"status" varchar,
	"coupon" varchar,
	"coupon_discount_percentage" numeric,
	"discount_amount" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"shortname" text,
	"name" text,
	"phonecode" text
);
--> statement-breakpoint
CREATE TABLE "evaluation_charges" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer,
	"currency" text,
	"turnaroundtime" text,
	"amount" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freerequests" (
	"id" serial PRIMARY KEY NOT NULL,
	"clubId" integer,
	"requests" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"country_id" integer
);
--> statement-breakpoint
CREATE TABLE "teamCoaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"coachId" integer NOT NULL,
	"enterprise_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teamjoinRequest" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer,
	"player_id" integer,
	"message" text,
	"status" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tempusers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tempusers" CASCADE;--> statement-breakpoint
ALTER TABLE "coaches" ALTER COLUMN "rating" SET DATA TYPE numeric(10, 1);--> statement-breakpoint
ALTER TABLE "coaches" ALTER COLUMN "rating" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "coaches" ALTER COLUMN "status" SET DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "enterprises" ALTER COLUMN "contactPerson" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "sender_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orderHistory" ALTER COLUMN "enterprise_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orderHistory" ALTER COLUMN "package_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orderHistory" ALTER COLUMN "amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orderHistory" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orderHistory" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orderHistory" ALTER COLUMN "createdAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "creator_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "coach_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "country" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "enterprise_id" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "coach_id" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "coachId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "playerId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "club_id" integer;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "visibility" varchar DEFAULT 'off';--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "team_id" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "currency" varchar DEFAULT '$';--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "facebook" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "xlink" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "youtube" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "cv" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "license_type" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "license" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "buy_evaluation" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "view_evaluation" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "facebook" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "xlink" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "youtube" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "enterprises" ADD COLUMN "status" text DEFAULT 'Active';--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "club_id" integer;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "organizationalRemarks" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "distributionRemarks" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "distributionScores" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "organizationScores" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "document" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "position" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "sport" text;--> statement-breakpoint
ALTER TABLE "evaluation_results" ADD COLUMN "thingsToWork" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "enterprise_id" integer;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "club_id" integer;--> statement-breakpoint
ALTER TABLE "orderHistory" ADD COLUMN "licenses" integer;--> statement-breakpoint
ALTER TABLE "orderHistory" ADD COLUMN "rate" integer;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "currency" varchar;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "club_id" integer;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "video_descriptionTwo" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "video_descriptionThree" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "jerseyNumber" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "jerseyNumberTwo" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "jerseyNumberThree" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "jerseyColorOne" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "jerseyColorTwo" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "jerseyColorThree" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "positionOne" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "positionTwo" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "positionThree" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "videoOneTiming" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "videoTwoTiming" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "videoThreeTiming" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "position" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "lighttype" text;--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "percentage" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "countryCodes" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "age_group" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "leage" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "visibility" varchar DEFAULT 'off';--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "facebook" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "xlink" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "youtube" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "buy_evaluation" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "view_evaluation" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "team_id" text DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gpa" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "school_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "facebook" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "xlink" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "youtube" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "age_group" text DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_year" text DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "visibility" varchar DEFAULT 'off';--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "coach_id";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "player_id";--> statement-breakpoint
ALTER TABLE "invitations" DROP COLUMN "sender_id";