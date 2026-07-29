import { getSession } from "./session";

export async function requireAuth() {
  const { loggedIn } = await getSession();
  if (!loggedIn) throw new Error("Unauthorized");
}