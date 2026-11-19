CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"page_id" uuid NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"data" bytea NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "files_page_idx" ON "files" ("page_id");--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_page_id_pages_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE;