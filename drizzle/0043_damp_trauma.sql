CREATE TABLE "ip_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"login_time" timestamp DEFAULT now() NOT NULL,
	"logout_time" timestamp
);
