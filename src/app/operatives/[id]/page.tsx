import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Badge, Card, Heading, Text } from "frosted-ui";
import { sql } from "@/lib/db";
import { STATUS_COLORS, STATUS_LABELS, fmtMoney, initials, timeAgo } from "@/lib/types";
import type { Submission, Task, User } from "@/lib/types";

type RecordRow = Submission & { taskTitle: string; payoutCents: number };

export default async function OperativePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const users = (await sql`SELECT * FROM users WHERE id = ${id}`) as unknown as User[];
  const operative = users[0];
  if (!operative) notFound();

  const [stats] = await sql`SELECT
      count(*) FILTER (WHERE status = 'approved')::int AS approved,
      count(*) FILTER (WHERE status = 'rejected')::int AS rejected,
      count(*) FILTER (WHERE status IN ('claimed', 'submitted'))::int AS active
    FROM submissions WHERE earner_id = ${id}`;

  const [earnings] = await sql`SELECT coalesce(sum(amount_cents), 0)::int AS lifetime
    FROM transactions WHERE user_id = ${id} AND kind = 'earning'`;

  const record = (await sql`SELECT s.*, t.title AS task_title, t.payout_cents
    FROM submissions s JOIN tasks t ON t.id = s.task_id
    WHERE s.earner_id = ${id} ORDER BY s.claimed_at DESC LIMIT 6`) as unknown as RecordRow[];

  const issued = (await sql`SELECT * FROM tasks WHERE poster_id = ${id} ORDER BY created_at DESC`) as unknown as Task[];

  const reviewed = stats.approved + stats.rejected;
  const rating = reviewed === 0 ? "New operative" : `${Math.round((stats.approved / reviewed) * 100)}% approval`;

  const skills = String(operative.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-8 pt-10">
      <section className="flex flex-col gap-4">
        <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
          Operative dossier
        </Text>
        <div className="flex items-center gap-4">
          <Avatar size="6" color="gray" fallback={initials(operative.name)} />
          <div className="flex flex-col gap-1">
            <Heading size="8">{operative.name}</Heading>
            <Text size="3" color="gray">
              {operative.bio}
            </Text>
          </div>
        </div>
        {skills.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {skills.map((skill) => (
              <Badge key={skill} color="gray" variant="soft">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card size="3" variant="surface">
          <div className="flex flex-col gap-1">
            <Text size="1" color="gray">
              Approval rating
            </Text>
            <Text size="7" weight="bold">
              {rating}
            </Text>
          </div>
        </Card>
        <Card size="3" variant="surface">
          <div className="flex flex-col gap-1">
            <Text size="1" color="gray">
              Contracts closed
            </Text>
            <Text size="7" weight="bold">
              {stats.approved}
            </Text>
          </div>
        </Card>
        <Card size="3" variant="surface">
          <div className="flex flex-col gap-1">
            <Text size="1" color="gray">
              Lifetime extracted
            </Text>
            <Text size="7" weight="bold" color="success">
              {fmtMoney(earnings.lifetime)}
            </Text>
          </div>
        </Card>
        <Card size="3" variant="surface">
          <div className="flex flex-col gap-1">
            <Text size="1" color="gray">
              Active engagements
            </Text>
            <Text size="7" weight="bold">
              {stats.active}
            </Text>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <Heading size="5">Record</Heading>
        {record.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--gray-a6)] py-12">
            <Text size="3" weight="bold">
              No contracts on record
            </Text>
            <Text size="2" color="gray">
              This operative hasn&apos;t accepted a contract yet.
            </Text>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {record.map((s) => (
              <Card
                key={s.id}
                size="2"
                variant="surface"
                render={<Link href={`/tasks/${s.taskId}`} />}
                className="transition-colors hover:bg-[var(--gray-a3)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Text size="2" weight="medium" className="leading-snug">
                      {s.taskTitle}
                    </Text>
                  </div>
                  <Badge color={STATUS_COLORS[s.status]} variant="soft">
                    {STATUS_LABELS[s.status]}
                  </Badge>
                  <Text size="1" color="gray">
                    {timeAgo(s.reviewedAt ?? s.submittedAt ?? s.claimedAt)}
                  </Text>
                  <Text size="3" weight="bold" color="success" className="font-mono">
                    {fmtMoney(s.payoutCents)}
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {issued.length ? (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Heading size="5">Issued contracts</Heading>
            <Badge size="2" color="gray" variant="soft">
              {issued.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-3">
            {issued.slice(0, 4).map((t) => (
              <Card
                key={t.id}
                size="2"
                variant="surface"
                render={<Link href={`/tasks/${t.id}`} />}
                className="transition-colors hover:bg-[var(--gray-a3)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Text size="2" weight="medium" className="leading-snug">
                      {t.title}
                    </Text>
                  </div>
                  <Badge color={t.status === "completed" ? "gray" : "orange"} variant="soft">
                    {t.status === "completed" ? "Closed" : "Open"}
                  </Badge>
                  <Text size="3" weight="bold" color="success" className="font-mono">
                    {fmtMoney(t.payoutCents)}
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
