CREATE TABLE "block_ips" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"block_ip_address" varchar(45) NOT NULL,
	"status" varchar(10) DEFAULT 'block'
);
