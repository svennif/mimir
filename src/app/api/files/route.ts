import { db } from '@/src/db';
import { files } from '@/src/db/schema';
import { getSession } from '@/src/lib/session';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/src/lib/files';
import { compressImage } from '@/src/lib/compress-image';

// A route handler rather than a server action: actions cap the request body at
// 1MB by default, which is smaller than a typical screenshot.
export async function POST(request: Request) {
  // The proxy already guards /api/files, but checking here too means auth
  // doesn't hinge on the proxy matcher regex staying the way it is.
  if (!(await getSession()).loggedIn) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    // Also what a body truncated by the proxy looks like: no closing boundary.
    return Response.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  const pageId = form.get('pageId');

  if (!(file instanceof File) || typeof pageId !== 'string') {
    return Response.json({ error: 'Expected a file and a pageId' }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return Response.json({ error: `Unsupported file type: ${file.type || 'unknown'}` }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: 'File too large' }, { status: 413 });
  }

  // Only attach to a live page: the foreign key would catch a page that doesn't
  // exist (as a 500), but not one that is sitting in the trash.
  const page = await db.query.pages.findFirst({
    where: { id: pageId, deletedAt: { isNull: true } },
    columns: { id: true },
  }).catch(() => undefined); // a malformed uuid makes Postgres throw; treat it as not found

  if (!page) {
    return Response.json({ error: 'Page not found' }, { status: 404 });
  }

  let compressed: Awaited<ReturnType<typeof compressImage>>;
  try {
    compressed = await compressImage(Buffer.from(await file.arrayBuffer()), file.type);
  } catch {
    // The type check above trusts the browser's label; this is where a file
    // that only claims to be an image gets caught.
    return Response.json({ error: 'Not a readable image' }, { status: 415 });
  }

  const [row] = await db
    .insert(files)
    .values({
      pageId: page.id,
      mimeType: compressed.mimeType,
      size: compressed.data.length,
      data: compressed.data,
    })
    .returning({ id: files.id });

  return Response.json({ url: `/api/files/${row.id}` }, { status: 201 });
}
