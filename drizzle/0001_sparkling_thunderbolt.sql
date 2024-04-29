ALTER TABLE "user" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
ALTER TABLE "event_logs" DROP CONSTRAINT "event_logs_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "resource_usage_logs" DROP CONSTRAINT "resource_usage_logs_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "resource_usage_logs" DROP CONSTRAINT "resource_usage_logs_instance_id_service_instances_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_instance_ability" DROP CONSTRAINT "user_instance_ability_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_instance_ability" DROP CONSTRAINT "user_instance_ability_instance_id_service_instances_id_fk";
--> statement-breakpoint
ALTER TABLE "event_logs" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "global_settings" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resource_usage_logs" ALTER COLUMN "details" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_instance_ability" ALTER COLUMN "token" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "service_instances" ADD COLUMN "data" jsonb;--> statement-breakpoint
ALTER TABLE "user_instance_ability" ADD COLUMN "data" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");