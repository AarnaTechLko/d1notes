CREATE TABLE IF NOT EXISTS "chatfriend" (
	"id" serial PRIMARY KEY NOT NULL,
	"chatfrom" integer,
	"chatto" integer,
	"chattoname" text,
	"chattotype" text,
	"club_id" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer,
	"sender_type" text,
	"receiver_id" integer,
	"receiver_type" text,
	"message" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"club_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enterprises" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizationName" text NOT NULL,
	"contactPerson" text NOT NULL,
	"owner_name" text,
	"package_id" integer,
	"email" text NOT NULL,
	"mobileNumber" text,
	"countryCodes" text,
	"address" text,
	"country" text,
	"state" text,
	"city" text,
	"logo" text,
	"affiliationDocs" text,
	"slug" text,
	"parent_id" integer,
	"role_id" integer,
	"password" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forgetPassword" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_type" text NOT NULL,
	"sender_id" integer NOT NULL,
	"email" text,
	"invitation_for" text,
	"mobile" text,
	"invitation_link" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "joinRequest" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer,
	"coach_id" integer,
	"club_id" integer,
	"type" text,
	"requestToID" integer,
	"message" text,
	"status" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "licenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer NOT NULL,
	"buyer_type" text NOT NULL,
	"package_id" integer NOT NULL,
	"payment_info" text,
	"licenseKey" text NOT NULL,
	"used_for" text,
	"used_by" text,
	"assigned_to" integer,
	"status" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"module_fields" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orderHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer NOT NULL,
	"package_id" integer NOT NULL,
	"amount" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"payment_info" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"packageName" text NOT NULL,
	"amount" text NOT NULL,
	"noOfLicnese" integer,
	"details" text NOT NULL,
	"status" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "playerbanner" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"usertype" text,
	"filepath" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer,
	"role_name" text,
	"module_id" text,
	"permissions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamPlayers" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"enterprise_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" text NOT NULL,
	"manager_name" text,
	"manager_email" text,
	"manager_phone" text,
	"logo" text NOT NULL,
	"description" text NOT NULL,
	"created_by" text NOT NULL,
	"club_id" integer,
	"slug" text NOT NULL,
	"creator_id" integer NOT NULL,
	"coach_id" integer NOT NULL,
	"team_type" text,
	"team_year" text,
	"cover_image" text,
	"password" text,
	"country" text,
	"state" text,
	"rating" integer,
	"city" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tempusers" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"grade_level" varchar,
	"location" varchar,
	"birthday" date,
	"gender" varchar,
	"sport" varchar,
	"team" varchar,
	"jersey" varchar,
	"position" varchar,
	"number" varchar,
	"email" varchar NOT NULL,
	"image" text,
	"bio" text,
	"country" varchar,
	"state" varchar,
	"city" varchar,
	"league" text,
	"countrycode" text,
	"password" text NOT NULL,
	"enterprise_id" text,
	"coach_id" text,
	"slug" text,
	"playingcountries" text,
	"height" text,
	"weight" text,
	"graduation" text,
	"status" varchar DEFAULT 'Inactive',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tempusers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "enterprise_id" text;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "status" varchar DEFAULT 'Inactive';--> statement-breakpoint
ALTER TABLE "player_evaluation" ADD COLUMN "rejectremarks" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "enterprise_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "coach_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "playingcountries" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "height" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "weight" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "graduation" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" varchar DEFAULT 'Inactive';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tempusers_unique_idx" ON "tempusers" ("email");