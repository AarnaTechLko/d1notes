CREATE TABLE "suspendlog" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"suspend_days" integer,
	"suspend_start_date" date,
	"suspend_end_date" date,
	"created_at" timestamp DEFAULT now()
);
