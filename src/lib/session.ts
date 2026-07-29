import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE = 'mimir_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 Days

export async function createSession() {
  const token = await new SignJWT({ loggedIn: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: '/'
  });
}

export async function getSession(): Promise<{ loggedIn: boolean }> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return { loggedIn: false };
  try {
    const { payload } = await jwtVerify(token, secret);
    return { loggedIn: payload.loggedIn === true }
  } catch {
    return { loggedIn: false }
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}