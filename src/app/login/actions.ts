'use server';

import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { createSession } from '@/src/lib/session';
import { checkRateLimit } from '@/src/lib/rate-limit';

type State = { error: string } | null;

export async function login(_prev: State, formData: FormData): Promise<State> {
  if (!checkRateLimit("login")) {
    return { error: "Too many attempts. Wait a minute" };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !password) {
    return { error: "Enter your password" };
  }

const hash = Buffer.from(process.env.APP_PASSWORD_HASH_B64!, "base64").toString();
const ok = await bcrypt.compare(password, hash);
  
  if (!ok) return { error: "Wrong password" };

  await createSession();
  redirect('/');
}