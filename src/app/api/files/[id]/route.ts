import { db } from '@/src/db';
import { getSession } from '@/src/lib/session';

export async function GET(_request: Request, ctx: RouteContext<'/api/files/[id]'>) {
  if (!(await getSession()).loggedIn) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await ctx.params;

  const file = await db.query.files.findFirst({
    where: { id },
    columns: { mimeType: true, data: true },
  }).catch(() => undefined); // malformed uuid → not found, rather than a 500

  if (!file) {
    return new Response('Not found', { status: 404 });
  }

  // postgres.js hands bytea back as a Buffer, which TS won't accept as a body
  // (it may sit on a SharedArrayBuffer). Copying ≤8MB into a plain Uint8Array is cheap.
  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mimeType,
      // A file's bytes never change after upload, so its URL can be cached
      // forever. `private` keeps shared caches (e.g. Cloudflare) from storing
      // something that sits behind a login.
      'Cache-Control': 'private, max-age=31536000, immutable',
      // Make the browser trust Content-Type instead of sniffing the bytes, so an
      // upload can never be reinterpreted as HTML and run on our origin.
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
