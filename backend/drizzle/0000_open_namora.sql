CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'owner',
	"business_id" text,
	"phone" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_inbox_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"source" text DEFAULT 'app' NOT NULL,
	"business_name" text,
	"requester_name" text,
	"requester_email" text,
	"requester_phone" text,
	"current_plan" text,
	"target_plan" text,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"service_type" text DEFAULT 'AC' NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"city" text,
	"plan" text DEFAULT 'Pro' NOT NULL,
	"subscription_status" text DEFAULT 'trialing' NOT NULL,
	"trial_ends_at" timestamp,
	"current_period_ends_at" timestamp,
	"subscription_notes" text,
	"whatsapp_mode" text DEFAULT 'basic' NOT NULL,
	"whatsapp_automation_status" text DEFAULT 'not_connected' NOT NULL,
	"whatsapp_automation_connected_at" timestamp,
	"whatsapp_automation_last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"plan" text NOT NULL,
	"service_interval" text DEFAULT 'Bulanan' NOT NULL,
	"unit_count" integer DEFAULT 1 NOT NULL,
	"value" integer NOT NULL,
	"next_service_at" timestamp NOT NULL,
	"status" text DEFAULT 'Aktif' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text NOT NULL,
	"units" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"category" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"buy_price" integer DEFAULT 0 NOT NULL,
	"sell_price" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"job_id" text,
	"number" text NOT NULL,
	"total" integer NOT NULL,
	"status" text DEFAULT 'Draft' NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"payment_method" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "job_items" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"inventory_id" text,
	"kind" text DEFAULT 'service' NOT NULL,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"total_price" integer DEFAULT 0 NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"number" text NOT NULL,
	"title" text NOT NULL,
	"customer_id" text NOT NULL,
	"technician_id" text,
	"assigned_technician_ids" jsonb,
	"type" text NOT NULL,
	"schedule_at" timestamp NOT NULL,
	"deadline_at" timestamp,
	"price" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'Normal' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"location" text NOT NULL,
	"before_photo_url" text,
	"after_photo_url" text,
	"cancel_reason" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"specialties" jsonb NOT NULL,
	"status" text DEFAULT 'Aktif' NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"latitude" real,
	"longitude" real,
	"last_seen_at" timestamp,
	"account_email" text,
	"account_status" text DEFAULT 'not_created' NOT NULL,
	"attendance_status" text DEFAULT 'Belum Check-in' NOT NULL,
	"attendance_photo_url" text,
	"attendance_note" text,
	"attendance_job_id" text,
	"attendance_location_label" text,
	"attendance_latitude" real,
	"attendance_longitude" real,
	"attendance_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technicians_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_inbox_requests" ADD CONSTRAINT "admin_inbox_requests_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_items" ADD CONSTRAINT "job_items_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_items" ADD CONSTRAINT "job_items_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;