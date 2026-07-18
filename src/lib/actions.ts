"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";
import { currentUser, DEMO_ACCOUNTS, DEMO_PASSWORD } from "./session";

const uid = (p: string) => `${p}_${randomUUID().replace(/-/g, "").slice(0, 10)}`;

export async function login(form: FormData) {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  const userId = DEMO_ACCOUNTS[email];
  if (!userId || password !== DEMO_PASSWORD) redirect("/login?error=1");
  const store = await cookies();
  store.set("wt_user", userId, { path: "/" });
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete("wt_user");
  redirect("/login");
}

export async function addSkill(form: FormData) {
  const user = await currentUser();
  const skill = String(form.get("skill") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 30);
  if (!skill) return;
  const skills = user.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (skills.some((s) => s.toLowerCase() === skill)) return;
  skills.push(skill);
  await sql`UPDATE users SET skills = ${skills.join(", ")} WHERE id = ${user.id}`;
  revalidatePath("/", "layout");
}

export async function removeSkill(skill: string) {
  const user = await currentUser();
  const skills = user.skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== skill.toLowerCase());
  await sql`UPDATE users SET skills = ${skills.join(", ")} WHERE id = ${user.id}`;
  revalidatePath("/", "layout");
}

export async function addCredential(form: FormData) {
  const user = await currentUser();
  const title = String(form.get("title") ?? "").trim().slice(0, 120);
  const issuer = String(form.get("issuer") ?? "").trim().slice(0, 80);
  const url = String(form.get("url") ?? "").trim();
  if (!title) return;
  await sql`INSERT INTO credentials (id, user_id, title, issuer, url, created_at)
    VALUES (${uid("crd")}, ${user.id}, ${title}, ${issuer || null}, ${url || null}, ${Date.now()})`;
  revalidatePath("/", "layout");
}

export async function removeCredential(credentialId: string) {
  const user = await currentUser();
  await sql`DELETE FROM credentials WHERE id = ${credentialId} AND user_id = ${user.id}`;
  revalidatePath("/", "layout");
}

export async function createTask(form: FormData) {
  const user = await currentUser();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const requirements = String(form.get("requirements") ?? "").trim();
  const category = String(form.get("category") ?? "content");
  const payoutCents = Math.round(Number(form.get("payout") ?? 0) * 100);
  const slotsTotal = Math.max(1, Math.floor(Number(form.get("slots") ?? 1)));
  const deadlineDays = Math.max(1, Math.floor(Number(form.get("deadline") ?? 7)));
  if (!title || !description || payoutCents < 100) return;
  const id = uid("tsk");
  await sql`INSERT INTO tasks (id, poster_id, title, description, category, requirements, payout_cents, slots_total, deadline_at, status, created_at)
    VALUES (${id}, ${user.id}, ${title}, ${description}, ${category}, ${requirements}, ${payoutCents}, ${slotsTotal}, ${Date.now() + deadlineDays * 86_400_000}, 'active', ${Date.now()})`;
  revalidatePath("/", "layout");
  redirect(`/tasks/${id}`);
}

export async function claimTask(taskId: string): Promise<{ error?: string }> {
  const user = await currentUser();
  const [task] = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
  if (!task || task.status !== "active") return { error: "This task is no longer active." };
  if (task.posterId === user.id) return { error: "You posted this task." };
  const [existing] = await sql`SELECT id FROM submissions WHERE task_id = ${taskId} AND earner_id = ${user.id}`;
  if (existing) return { error: "You already have a submission on this task." };
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM submissions WHERE task_id = ${taskId} AND status != 'rejected'`;
  if (count >= task.slotsTotal) return { error: "All slots are taken." };
  await sql`INSERT INTO submissions (id, task_id, earner_id, status, claimed_at)
    VALUES (${uid("sub")}, ${taskId}, ${user.id}, 'claimed', ${Date.now()})`;
  revalidatePath("/", "layout");
  return {};
}

export async function submitProof(taskId: string, form: FormData): Promise<{ error?: string }> {
  const user = await currentUser();
  const proofText = String(form.get("proofText") ?? "").trim();
  const proofUrl = String(form.get("proofUrl") ?? "").trim();
  if (!proofText && !proofUrl) return { error: "Add a link or a note so the poster can review your work." };
  const [existing] = await sql`SELECT * FROM submissions WHERE task_id = ${taskId} AND earner_id = ${user.id}`;
  const nowMs = Date.now();
  if (existing && existing.status === "claimed") {
    await sql`UPDATE submissions SET status = 'submitted', proof_text = ${proofText || null}, proof_url = ${proofUrl || null}, submitted_at = ${nowMs} WHERE id = ${existing.id}`;
  } else if (!existing) {
    const [task] = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (!task || task.status !== "active") return { error: "This task is no longer active." };
    if (task.posterId === user.id) return { error: "You posted this task." };
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM submissions WHERE task_id = ${taskId} AND status != 'rejected'`;
    if (count >= task.slotsTotal) return { error: "All slots are taken." };
    await sql`INSERT INTO submissions (id, task_id, earner_id, status, proof_text, proof_url, claimed_at, submitted_at)
      VALUES (${uid("sub")}, ${taskId}, ${user.id}, 'submitted', ${proofText || null}, ${proofUrl || null}, ${nowMs}, ${nowMs})`;
  } else {
    return { error: "This submission was already reviewed." };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function approveSubmission(submissionId: string) {
  const user = await currentUser();
  await sql.begin(async (tx) => {
    const [sub] = await tx`SELECT s.*, t.poster_id, t.payout_cents, t.slots_total
      FROM submissions s JOIN tasks t ON t.id = s.task_id WHERE s.id = ${submissionId}`;
    if (!sub || sub.posterId !== user.id || sub.status !== "submitted") return;
    const nowMs = Date.now();
    await tx`UPDATE submissions SET status = 'approved', reviewed_at = ${nowMs} WHERE id = ${submissionId}`;
    await tx`INSERT INTO transactions (id, user_id, amount_cents, kind, submission_id, created_at)
      VALUES (${uid("txn")}, ${sub.earnerId}, ${sub.payoutCents}, 'earning', ${submissionId}, ${nowMs})`;
    await tx`UPDATE users SET balance_cents = balance_cents + ${sub.payoutCents} WHERE id = ${sub.earnerId}`;
    const [{ count }] = await tx`SELECT count(*)::int AS count FROM submissions WHERE task_id = ${sub.taskId} AND status = 'approved'`;
    if (count >= sub.slotsTotal) {
      await tx`UPDATE tasks SET status = 'completed' WHERE id = ${sub.taskId}`;
    }
  });
  revalidatePath("/", "layout");
}

export async function rejectSubmission(submissionId: string, reason: string) {
  const user = await currentUser();
  const [sub] = await sql`SELECT s.id, s.status, t.poster_id
    FROM submissions s JOIN tasks t ON t.id = s.task_id WHERE s.id = ${submissionId}`;
  if (!sub || sub.posterId !== user.id || sub.status !== "submitted") return;
  await sql`UPDATE submissions SET status = 'rejected', reject_reason = ${reason.trim() || "Didn't meet the requirements."}, reviewed_at = ${Date.now()} WHERE id = ${submissionId}`;
  revalidatePath("/", "layout");
}

export async function withdraw() {
  const user = await currentUser();
  if (user.balanceCents <= 0) return;
  await sql.begin(async (tx) => {
    await tx`INSERT INTO transactions (id, user_id, amount_cents, kind, created_at)
      VALUES (${uid("txn")}, ${user.id}, ${user.balanceCents}, 'withdrawal', ${Date.now()})`;
    await tx`UPDATE users SET balance_cents = 0 WHERE id = ${user.id}`;
  });
  revalidatePath("/", "layout");
}
