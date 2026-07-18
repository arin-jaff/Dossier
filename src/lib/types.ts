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

export function fmtMoney(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars.toLocaleString()}` : `$${dollars.toFixed(2)}`;
}
