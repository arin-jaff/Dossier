import Link from "next/link";
import { Badge, Card, Heading, Text } from "frosted-ui";
import { ReviewQueue, type QueueItem } from "@/components/review-queue";
import { sql } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { CATEGORY_LABELS, daysLeft, fmtMoney } from "@/lib/types";
import type { Task } from "@/lib/types";

type IssuedTask = Task & { taken: number; pending: number; approved: number };

export default async function Dashboard() {
  const user = await currentUser();

  const tasks = (await sql`SELECT t.*,
    (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status != 'rejected') AS taken,
    (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status = 'submitted') AS pending,
    (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status = 'approved') AS approved
    FROM tasks t WHERE t.poster_id = ${user.id} ORDER BY t.created_at DESC`) as unknown as IssuedTask[];

  const queue = (await sql`SELECT s.id, s.task_id, s.proof_text, s.proof_url, s.submitted_at,
    t.title AS task_title, t.payout_cents, u.name AS earner_name
    FROM submissions s JOIN tasks t ON t.id = s.task_id JOIN users u ON u.id = s.earner_id
    WHERE t.poster_id = ${user.id} AND s.status = 'submitted' ORDER BY s.submitted_at ASC`) as unknown as QueueItem[];

  const openTasks = tasks.filter((t) => t.status === "active");
  const committed = openTasks.reduce((sum, t) => sum + t.payoutCents * t.slotsTotal, 0);

  return (
    <div className="flex flex-col gap-8 pt-10">
      <section className="flex flex-col gap-2">
        <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
          Handler console
        </Text>
        <Heading size="8">Your contracts</Heading>
        <Text size="4" color="gray">
          Issue contracts, review debriefs, release payouts.
        </Text>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge size="2" color="gray" variant="soft">
            {openTasks.length} open contract{openTasks.length === 1 ? "" : "s"}
          </Badge>
          <Badge size="2" color="info" variant="soft">
            {queue.length} debrief{queue.length === 1 ? "" : "s"} pending
          </Badge>
          <Badge size="2" color="success" variant="soft">
            {fmtMoney(committed)} committed
          </Badge>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Heading size="5">Debriefs awaiting review</Heading>
        <ReviewQueue items={queue} />
      </section>

      <section className="flex flex-col gap-4">
        <Heading size="5">Issued contracts</Heading>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--gray-a6)] py-16">
            <Text size="3" weight="bold">
              You haven&apos;t issued a contract yet
            </Text>
            <Text size="2" color="gray">
              Post one and operatives on The Board pick it up.
            </Text>
            <Link href="/create">
              <Badge size="2" color="orange" variant="soft">
                Issue your first contract
              </Badge>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((t) => (
              <Card
                key={t.id}
                size="3"
                variant="surface"
                render={<Link href={`/tasks/${t.id}`} />}
                className="transition-colors hover:bg-[var(--gray-a3)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Text size="3" weight="bold" className="leading-snug">
                      {t.title}
                    </Text>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color="gray" variant="soft">
                        {CATEGORY_LABELS[t.category]}
                      </Badge>
                      <Text size="1" color="gray">
                        {t.approved}/{t.slotsTotal} filled · {daysLeft(t.deadlineAt)}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.pending > 0 ? (
                      <Badge size="2" color="orange" variant="soft">
                        {t.pending} debrief{t.pending === 1 ? "" : "s"}
                      </Badge>
                    ) : null}
                    {t.status === "completed" ? (
                      <Badge size="2" color="gray" variant="soft">
                        Closed
                      </Badge>
                    ) : null}
                    <Text size="4" weight="bold" color="success">
                      {fmtMoney(t.payoutCents)}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
