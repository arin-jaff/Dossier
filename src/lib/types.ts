export type Category = "content" | "design" | "writing" | "video" | "social" | "dev";
export type TaskStatus = "active" | "completed";
export type SubmissionStatus = "claimed" | "submitted" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  bio: string;
  balanceCents: number;
}

export interface Task {
  id: string;
  posterId: string;
  title: string;
  description: string;
  category: Category;
  requirements: string;
  payoutCents: number;
  slotsTotal: number;
  deadlineAt: number;
  status: TaskStatus;
  createdAt: number;
}

export interface Submission {
  id: string;
  taskId: string;
  earnerId: string;
  status: SubmissionStatus;
  proofText: string | null;
  proofUrl: string | null;
  rejectReason: string | null;
  claimedAt: number;
  submittedAt: number | null;
  reviewedAt: number | null;
}

export interface Txn {
  id: string;
  userId: string;
  amountCents: number;
  kind: "earning" | "withdrawal";
  submissionId: string | null;
  createdAt: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  content: "Content & Clips",
  design: "Design",
  writing: "Writing",
  video: "Video",
  social: "Social Media",
  dev: "Dev & QA",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  claimed: "Active",
  submitted: "Debrief in review",
  approved: "Closed — extracted",
  rejected: "Declined",
};

export const STATUS_COLORS: Record<SubmissionStatus, "gray" | "info" | "success" | "danger"> = {
  claimed: "gray",
  submitted: "info",
  approved: "success",
  rejected: "danger",
};

export function fmtMoney(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars.toLocaleString()}` : `$${dollars.toFixed(2)}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const DAY = 86_400_000;

export function daysLeft(deadlineAt: number): string {
  const d = Math.ceil((deadlineAt - Date.now()) / DAY);
  if (d < 0) return "ended";
  if (d === 0) return "ends today";
  return `${d}d left`;
}

export function timeAgo(ts: number): string {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
