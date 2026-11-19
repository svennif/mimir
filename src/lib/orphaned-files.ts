import { sql } from 'drizzle-orm';
import { db } from '@/src/db';

// How long a file must stay unreferenced before it is deleted. Deleting the
// moment an image leaves a page would break Ctrl+Z (the block comes back, its
// image doesn't) and cut-from-one-page-paste-into-another. A day covers both,
// and a few stray MB for a day costs nothing.
const GRACE = '24 hours';

// The sweep reads every page's content, so it runs at most this often rather
// than on every autosave (which fires every few seconds while typing).
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

// In-process state: resets on restart, so the first save after a restart always sweeps.
let lastSweepAt = 0;

export function maybeSweepOrphanedFiles() {
  if (Date.now() - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = Date.now(); // set before awaiting, so concurrent saves don't all start one

  return sweepOrphanedFiles().catch((err) => {
    // Housekeeping only; a failed sweep just means the next one does the work.
    console.error('Orphaned file sweep failed:', err);
  });
}

/**
 * Mark-and-sweep over `files`:
 *  - a file no page mentions gets `orphaned_at` stamped (if it isn't already);
 *  - a file that is mentioned again (undo, paste elsewhere) gets it cleared;
 *  - a file orphaned for longer than GRACE, and still unmentioned, is deleted.
 *
 * "Mentioned" means the text `/api/files/<id>` appears anywhere in any page's
 * content — trashed pages included, so restoring a page brings its images back.
 * Matching the raw JSON text rather than walking image blocks is deliberately
 * generous: a link or a pasted URL to the file also keeps it alive. Wrongly
 * keeping a file costs some disk; wrongly deleting one loses an image.
 *
 * It's one statement, so all parts see the same snapshot of `pages`.
 */
export async function sweepOrphanedFiles() {
  const [result] = await db.execute<{ deleted: number; freedBytes: number }>(sql`
    WITH referenced AS (
      SELECT DISTINCT m[1]::uuid AS id
      FROM pages,
           regexp_matches(
             content::text,
             '/api/files/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
             'g'
           ) AS m
    ),
    readopted AS (
      UPDATE files SET orphaned_at = NULL
      WHERE orphaned_at IS NOT NULL AND id IN (SELECT id FROM referenced)
    ),
    marked AS (
      UPDATE files SET orphaned_at = now()
      WHERE orphaned_at IS NULL AND id NOT IN (SELECT id FROM referenced)
    ),
    deleted AS (
      DELETE FROM files
      WHERE orphaned_at < now() - ${GRACE}::interval
        AND id NOT IN (SELECT id FROM referenced)
      RETURNING size
    )
    SELECT count(*)::int AS "deleted", coalesce(sum(size), 0)::int AS "freedBytes" FROM deleted
  `);

  if (result.deleted > 0) {
    console.info(`Deleted ${result.deleted} orphaned file(s), freed ${(result.freedBytes / 1024 / 1024).toFixed(1)}MB`);
  }
  return result;
}
