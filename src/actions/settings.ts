'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/src/db';
import { settings } from '@/src/db/schema';
import { requireAuth } from '@/src/lib/auth';
import { DISPLAY_NAME_KEY, DISPLAY_NAME_MAX } from '@/src/lib/settings';

type State = { ok: true } | { error: string } | null;

export async function saveDisplayName(_prev: State, formData: FormData): Promise<State> {
  await requireAuth();

  const raw = formData.get('name');
  if (typeof raw !== 'string') return { error: 'Enter a name' };

  // maxLength on the input is only a hint — clamp here too.
  const name = raw.trim().slice(0, DISPLAY_NAME_MAX);

  // An empty field clears the name rather than storing "".
  if (name) {
    await db
      .insert(settings)
      .values({ key: DISPLAY_NAME_KEY, value: name })
      .onConflictDoUpdate({ target: settings.key, set: { value: name } });
  } else {
    await db.delete(settings).where(eq(settings.key, DISPLAY_NAME_KEY));
  }

  // The sidebar (layout) and the greeting (home) both show it.
  revalidatePath('/', 'layout');
  return { ok: true };
}
