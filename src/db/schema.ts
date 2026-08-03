import { sql } from 'drizzle-orm';
import {
  pgTable, uuid, text, jsonb, timestamp, index, type AnyPgColumn, integer
} from "drizzle-orm/pg-core";

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default(''),
  icon: text('icon'), // nullable emoji
  content: jsonb("content").notNull().default(sql`'[]'::jsonb`), // BlockNote Block[] verbatim
  textContent: text("text_content").notNull().default(""), // Plain text projection
  parentId: uuid("parent_id").references((): AnyPgColumn => pages.id, { onDelete: "cascade" }),
  position: text("position").notNull(), // fractional index
  favoritePosition: text("favorite_position"), // null = not starred
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // soft delete
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull().defaultNow(),
  version: integer('version').notNull().default(1),
}, (table) => [
  index("pages_parent_deleted_position_idx").on(table.parentId, table.deletedAt, table.position),
  index("pages_favorite_position_idx").on(table.favoritePosition),
  index("pages_deleted_idx").on(table.deletedAt),
]);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
  blockId: text("block_id"), // BlockNote block.id the comment anchors to
  body: text("body").notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }), // null = in inbox
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("comments_page_idx").on(table.pageId),
  index("comments_resolved_created_idx").on(table.resolvedAt, table.createdAt),
]);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});
