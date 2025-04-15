CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"replied_by" text NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "userOrgStatus" (
	"org_user_id" integer,
	"enterprise_id" integer,
	"status" text DEFAULT 'Pending' NOT NULL,
	"text" text
);
--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "ticket_from" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "status" varchar DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "role" varchar;--> statement-breakpoint
ALTER TABLE "userOrgStatus" ADD CONSTRAINT "userOrgStatus_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;