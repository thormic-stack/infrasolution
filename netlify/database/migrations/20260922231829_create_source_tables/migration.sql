CREATE TABLE "kiosk_interactions" (
	"id" serial PRIMARY KEY,
	"user_query" text NOT NULL,
	"suggested_products" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"house" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"price" text DEFAULT 'On Request' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sourcing_requests" (
	"id" serial PRIMARY KEY,
	"name" text DEFAULT 'Anonymous Client' NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"city" text DEFAULT 'Lagos' NOT NULL,
	"product_name" text NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"reply_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
