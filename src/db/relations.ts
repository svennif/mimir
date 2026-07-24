import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  pages: {
    parent: r.one.pages({
      from: r.pages.parentId,
      to: r.pages.id,
    }),
    children: r.many.pages({
      from: r.pages.id,
      to: r.pages.parentId,
    }),
    comments: r.many.comments(),
  },
  comments: {
    page: r.one.pages({
      from: r.comments.pageId,
      to: r.pages.id,
      optional: false, // page_id is NOT NULL, so this is never null
    }),
  },
}));