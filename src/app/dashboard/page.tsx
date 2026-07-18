import Link from "next/link";
import { Badge, Card, Heading, Progress, Text, Tooltip } from "frosted-ui";
import { AcceptButton } from "@/components/accept-button";
import { PageArt } from "@/components/page-art";
import { ReviewQueue, type QueueItem } from "@/components/review-queue";
import { sql } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { CATEGORY_LABELS, daysLeft, fmtMoney } from "@/lib/types";
import type { Task } from "@/lib/types";

type IssuedTask = Task & { taken: number; pending: number; approved: number };
type SuggestedTask = Task & { posterName: string; taken: number };

function parseRequirements(raw: string): string[] {
  return String(raw ?? "")
    .split("\n")
    .map((l) => l.replace(/^- /, "").trim())
    .filter(Boolean);
}

export default async function Dashboard() {
  const user = await currentUser();

  const tasks = (await sql`SELECT t.*,
    (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status != 'rejected') AS taken,
    (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status = 'submitted') AS pending,
    (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status = 'approved') AS approved
    FROM tasks t WHERE t.poster_id = ${user.id} ORDER BY t.created_at DESC`) as unknown as IssuedTask[];

  const queue = (await sql`SELECT s.id, s.task_id, s.earner_id, s.proof_text, s.proof_url, s.submitted_at,
    t.title AS task_title, t.payout_cents, u.name AS earner_name
    FROM submissions s JOIN tasks t ON t.id = s.task_id JOIN users u ON u.id = s.earner_id
    WHERE t.poster_id = ${user.id} AND s.status = 'submitted' ORDER BY s.submitted_at ASC`) as unknown as QueueItem[];

  const candidates = (await sql`SELECT t.*, u.name AS poster_name,
    (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status != 'rejected') AS taken
    FROM tasks t JOIN users u ON u.id = t.poster_id
    WHERE t.status = 'active' AND t.poster_id != ${user.id}
      AND NOT EXISTS (SELECT 1 FROM submissions s WHERE s.task_id = t.id AND s.earner_id = ${user.id})
    ORDER BY t.created_at DESC`) as unknown as SuggestedTask[];

  const skills = user.skills
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const scored = candidates
    .filter((t) => t.taken < t.slotsTotal)
    .map((t) => {
      const hay = `${t.title} ${t.description} ${CATEGORY_LABELS[t.category]}`.toLowerCase();
      return { t, hay, score: skills.filter((s) => hay.includes(s)).length };
    });

  const matched = scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.t.createdAt - a.t.createdAt)
    .slice(0, 3);
  const filler = scored
    .filter((x) => x.score === 0)
    .sort((a, b) => b.t.createdAt - a.t.createdAt)
    .slice(0, 3 - matched.length);
  const suggestions = [...matched, ...filler];
  const matchedSkills = skills.filter((s) => matched.some((x) => x.hay.includes(s)));

  const openTasks = tasks.filter((t) => t.status === "active");
  const committed = openTasks.reduce((sum, t) => sum + t.payoutCents * t.slotsTotal, 0);

  return (
    <div className="flex flex-col gap-8 pt-10">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--gray-a4)] p-6">
        <PageArt src="/console-art.png" opacity={0.25} />
        <div className="relative flex flex-col gap-2">
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
          <Tooltip content="Payout × slots across your active contracts">
            <Badge size="2" color="success" variant="soft">
              {fmtMoney(committed)} committed
            </Badge>
          </Tooltip>
        </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Heading size="5">Debriefs awaiting review</Heading>
        <ReviewQueue items={queue} />
      </section>

      {suggestions.length ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Heading size="5">Suggested for you</Heading>
            <Text size="2" color="gray">
              {matchedSkills.length ? `Matched to your skills: ${matchedSkills.join(", ")}` : "Newest on the Board"}
            </Text>
          </div>
          <div className="flex flex-col gap-3">
            {suggestions.map(({ t }) => (
              <Card key={t.id} size="3" variant="surface">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Text
                        size="3"
                        weight="bold"
                        render={<Link href={`/tasks/${t.id}`} />}
                        className="leading-snug hover:underline"
                      >
                        {t.title}
                      </Text>
                      <Badge color="gray" variant="soft">
                        {CATEGORY_LABELS[t.category]}
                      </Badge>
                    </div>
                    <Text render={<p />} size="2" color="gray" className="line-clamp-1">
                      {t.description}
                    </Text>
                    <Text size="1" color="gray">
                      {t.posterName} · {t.slotsTotal - t.taken} slot{t.slotsTotal - t.taken === 1 ? "" : "s"} left
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <Text size="4" weight="bold" color="success">
                      {fmtMoney(t.payoutCents)}
                    </Text>
                    <AcceptButton taskId={t.id} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

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
            {tasks.map((t) => {
              const requirements = parseRequirements(t.requirements);
              return (
                <Card key={t.id} size="3" variant="surface">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Text
                          size="3"
                          weight="bold"
                          render={<Link href={`/tasks/${t.id}`} />}
                          className="leading-snug hover:underline"
                        >
                          {t.title}
                        </Text>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge color="gray" variant="soft">
                            {CATEGORY_LABELS[t.category]}
                          </Badge>
                          <Text size="1" color="gray">
                            {t.approved}/{t.slotsTotal} filled
                          </Text>
                          <Text size="1" color="gray" className="font-mono">
                            {daysLeft(t.deadlineAt)}
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
                    <Text render={<p />} size="2" color="gray" className="line-clamp-2">
                      {t.description}
                    </Text>
                    <Progress size="1" color={t.status === "completed" ? "gray" : "success"} value={t.approved} max={t.slotsTotal} />
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
                        <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
                          Deliverables &amp; brief
                        </Text>
                        <Text
                          size="1"
                          color="gray"
                          className="inline-block transition-transform group-open:rotate-45"
                        >
                          +
                        </Text>
                      </summary>
                      <div className="flex flex-col gap-3 pt-3">
                        <Text render={<p />} size="2" color="gray" className="whitespace-pre-line leading-relaxed">
                          {t.description}
                        </Text>
                        {requirements.length ? (
                          <div className="flex flex-col gap-1.5">
                            {requirements.map((r) => (
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
                        ) : null}
                      </div>
                    </details>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
