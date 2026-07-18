import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";
import type { User } from "./types";

export const DEMO_PASSWORD = "operative";
export const DEMO_ACCOUNTS: Record<string, string> = {
  "alex@dossier.app": "usr_alex",
  "sam@dossier.app": "usr_sam",
  "jordan@dossier.app": "usr_jordan",
};

export async function sessionUser(): Promise<User | null> {
  const store = await cookies();
  const id = store.get("wt_user")?.value;
  if (!id) return null;
  const rows = await sql<User[]>`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function currentUser(): Promise<User> {
  const user = await sessionUser();
  if (!user) redirect("/login");
  return user;
}
