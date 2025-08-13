CREATE TABLE "role" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(100) NOT NULL,
	"role_name" varchar(100),
	"change_password" boolean DEFAULT false,
	"refund" boolean DEFAULT false,
	"monitor_activity" boolean DEFAULT false,
	"view_finance" boolean DEFAULT false,
	"access_ticket" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
