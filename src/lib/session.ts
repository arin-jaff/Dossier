import { cookies } from "next/headers";
import { sql } from "./db";
import type { User } from "./types";

export const PERSONA_IDS = ["usr_alex", "usr_sam", "usr_jordan"];

export async function currentUser(): Promise<User> {
  const store = await cookies();
  const id = store.get("wt_user")?.value ?? "usr_alex";
  const rows = await sql<User[]>`SELECT * FROM users WHERE id = ${id}`;
  if (rows[0]) return rows[0];
  const fallback = await sql<User[]>`SELECT * FROM users WHERE id = 'usr_alex'`;
  return fallback[0];
}

export async function listPersonas(): Promise<User[]> {
  return sql<User[]>`SELECT * FROM users WHERE id = ANY(${PERSONA_IDS}) ORDER BY name`;
}
