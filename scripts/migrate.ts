import { sql } from "../src/lib/db";

async function main() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    name text NOT NULL,
    bio text NOT NULL DEFAULT '',
    skills text NOT NULL DEFAULT '',
    balance_cents int NOT NULL DEFAULT 0
  )`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills text NOT NULL DEFAULT ''`;
  await sql`CREATE TABLE IF NOT EXISTS tasks (
    id text PRIMARY KEY,
    poster_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    requirements text NOT NULL DEFAULT '',
    payout_cents int NOT NULL,
    slots_total int NOT NULL,
    deadline_at bigint NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at bigint NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS submissions (
    id text PRIMARY KEY,
    task_id text NOT NULL,
    earner_id text NOT NULL,
    status text NOT NULL,
    proof_text text,
    proof_url text,
    reject_reason text,
    claimed_at bigint NOT NULL,
    submitted_at bigint,
    reviewed_at bigint,
    UNIQUE (task_id, earner_id)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS credentials (
    id text PRIMARY KEY,
    user_id text NOT NULL,
    title text NOT NULL,
    issuer text,
    url text,
    created_at bigint NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS transactions (
    id text PRIMARY KEY,
    user_id text NOT NULL,
    amount_cents int NOT NULL,
    kind text NOT NULL,
    submission_id text,
    created_at bigint NOT NULL
  )`;
  console.log("migrated");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
