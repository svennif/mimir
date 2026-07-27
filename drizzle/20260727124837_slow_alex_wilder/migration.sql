CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"page_id" uuid NOT NULL,
	"block_id" text,
	"body" text NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"title" text DEFAULT '' NOT NULL,
	"icon" text,
	"content" jsonb DEFAULT '[]' NOT NULL,
	"text_content" text DEFAULT '' NOT NULL,
	"parent_id" uuid,
	"position" text NOT NULL,
	"favorite_position" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "comments_page_idx" ON "comments" ("page_id");--> statement-breakpoint
CREATE INDEX "comments_resolved_created_idx" ON "comments" ("resolved_at","created_at");--> statement-breakpoint
CREATE INDEX "pages_parent_deleted_position_idx" ON "pages" ("parent_id","deleted_at","position");--> statement-breakpoint
CREATE INDEX "pages_favorite_position_idx" ON "pages" ("favorite_position");--> statement-breakpoint
CREATE INDEX "pages_deleted_idx" ON "pages" ("deleted_at");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_page_id_pages_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE CASCADE;