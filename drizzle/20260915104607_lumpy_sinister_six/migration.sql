DROP INDEX IF EXISTS "pages_parent_deleted_position_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "pages_favorite_position_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_favorite_position_idx" ON "pages" ("favorite_position") WHERE "favorite_position" IS NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "pages_deleted_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_deleted_idx" ON "pages" ("deleted_at") WHERE "deleted_at" IS NOT NULL;--> statement-breakpoint
WITH ranked AS (SELECT id, row_number() OVER (PARTITION BY parent_id ORDER BY position, created_at, id) AS n FROM pages WHERE deleted_at IS NULL) UPDATE pages p SET position = 'a' || substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'::text, ranked.n::int, 1) FROM ranked WHERE p.id = ranked.id;--> statement-breakpoint
CREATE UNIQUE INDEX "pages_parent_position_uniq" ON "pages" ("parent_id","position") NULLS NOT DISTINCT WHERE "deleted_at" IS NULL;