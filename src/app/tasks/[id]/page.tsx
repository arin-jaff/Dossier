import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Badge, Heading, Separator, Text } from "frosted-ui";
import { ActionPanel } from "@/components/action-panel";
import { sql } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { CATEGORY_LABELS, daysLeft, initials, timeAgo } from "@/lib/types";
import type { Category, Submission } from "@/lib/types";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();

  const [task] = await sql`
    SELECT t.*, u.name AS poster_name, u.bio AS poster_bio,
      (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status != 'rejected') AS taken,
      (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status = 'submitted') AS pending
    FROM tasks t JOIN users u ON u.id = t.poster_id WHERE t.id = ${id}`;
  if (!task) notFound();

  const mineRows = (await sql`SELECT * FROM submissions WHERE task_id = ${id} AND earner_id = ${user.id}`) as unknown as Submission[];
  const mine = mineRows[0] ?? null;

  const slotsLeft = Math.max(0, task.slotsTotal - task.taken);
  const requirements = String(task.requirements ?? "")
    .split("\n")
    .map((l: string) => l.replace(/^- /, "").trim())
    .filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-8 pt-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Badge color="orange" variant="soft">
            {CATEGORY_LABELS[task.category as Category]}
          </Badge>
          {task.status === "completed" ? (
            <Badge color="gray" variant="soft">
              Closed
            </Badge>
          ) : null}
          <Text size="1" color="gray">
            Posted {timeAgo(task.createdAt)}
          </Text>
        </div>
        <Heading size="7">{task.title}</Heading>
        <div className="flex flex-col gap-1.5">
          <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
            Handler
          </Text>
          <Link href={`/operatives/${task.posterId}`} className="transition-opacity hover:opacity-80">
            <div className="flex items-center gap-3">
              <Avatar size="3" color="gray" fallback={initials(task.posterName)} />
              <div className="flex flex-col">
                <Text size="2" weight="medium">
                  {task.posterName}
                </Text>
                <Text size="1" color="gray">
                  {task.posterBio}
                </Text>
              </div>
            </div>
          </Link>
        </div>
        <Separator size="4" />
        <div className="flex flex-col gap-2">
          <Heading size="4">The brief</Heading>
          <Text render={<p />} size="3" color="gray" className="whitespace-pre-line leading-relaxed">
            {task.description}
          </Text>
        </div>
        {requirements.length ? (
          <div className="flex flex-col gap-2">
            <Heading size="4">Deliverables</Heading>
            <div className="flex flex-col gap-1.5">
              {requirements.map((r: string) => (
                <div key={r} className="flex gap-2.5">
                  <Text size="2" color="gray" className="select-none">
                    —
                  </Text>
                  <Text size="2" color="gray">
                    {r}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div>
        <ActionPanel
          taskId={task.id}
          payoutCents={task.payoutCents}
          slotsLeft={slotsLeft}
          slotsTotal={task.slotsTotal}
          deadline={daysLeft(task.deadlineAt)}
          isOwner={task.posterId === user.id}
          taskStatus={task.status}
          pendingCount={task.pending}
          mine={mine}
        />
      </div>
    </div>
  );
}
