CREATE TABLE "ability" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluation_id" integer NOT NULL,
	"filename" text NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
