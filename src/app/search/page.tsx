import Link from "next/link";
import { Avatar, Badge, Card, Heading, Text, TextField } from "frosted-ui";
import { TaskCard, type FeedTask } from "@/components/task-card";
import { sql } from "@/lib/db";
import { fmtMoney, initials } from "@/lib/types";

const POPULAR_SKILLS = ["video editing", "design", "copywriting", "qa", "translation", "clipping"];

type OperativeRow = { id: string; name: string; bio: string; skills: string };
type CountRow = { earnerId: string; approved: number; rejected: number };
type LifetimeRow = { userId: string; lifetime: number };

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const like = `%${query}%`;

  let contracts: FeedTask[] = [];
  let operatives: OperativeRow[] = [];
  const counts = new Map<string, CountRow>();
  const lifetimes = new Map<string, number>();

  if (query) {
    [contracts, operatives] = await Promise.all([
      sql`
        SELECT t.id, t.title, t.description, t.category, t.payout_cents, t.slots_total, t.deadline_at,
          u.name AS poster_name,
          (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status != 'rejected') AS taken
        FROM tasks t
        JOIN users u ON u.id = t.poster_id
        WHERE t.status = 'active'
          AND (t.title ILIKE ${like} OR t.description ILIKE ${like} OR t.category ILIKE ${like})
        ORDER BY t.created_at DESC` as unknown as Promise<FeedTask[]>,
      sql`
        SELECT id, name, bio, skills FROM users
        WHERE skills ILIKE ${like} OR name ILIKE ${like} OR bio ILIKE ${like}
        ORDER BY (CASE WHEN skills ILIKE ${like} THEN 0 ELSE 1 END), name` as unknown as Promise<
        OperativeRow[]
      >,
    ]);

    const ids = operatives.map((o) => o.id);
    if (ids.length) {
      const [countRows, lifetimeRows] = await Promise.all([
        sql`
          SELECT earner_id,
            count(*) FILTER (WHERE status = 'approved')::int AS approved,
            count(*) FILTER (WHERE status = 'rejected')::int AS rejected
          FROM submissions WHERE earner_id IN ${sql(ids)}
          GROUP BY earner_id` as unknown as Promise<CountRow[]>,
        sql`
          SELECT user_id, coalesce(sum(amount_cents), 0)::int AS lifetime
          FROM transactions WHERE kind = 'earning' AND user_id IN ${sql(ids)}
          GROUP BY user_id` as unknown as Promise<LifetimeRow[]>,
      ]);
      for (const r of countRows) counts.set(r.earnerId, r);
      for (const r of lifetimeRows) lifetimes.set(r.userId, r.lifetime);
    }
  }

  const approvalText = (id: string) => {
    const c = counts.get(id);
    const total = (c?.approved ?? 0) + (c?.rejected ?? 0);
    if (total === 0) return "New operative";
    return `${Math.round(((c?.approved ?? 0) / total) * 100)}% approval`;
  };

  const bothEmpty = query && contracts.length === 0 && operatives.length === 0;

  return (
    <div className="flex flex-col gap-8 pt-10">
      <section className="flex flex-col gap-3">
        <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
          Search
        </Text>
        <Heading size="8">Find work. Find people.</Heading>
        <form action="/search" className="w-full max-w-xl">
          <TextField.Root size="3">
            <TextField.Input
              name="q"
              defaultValue={query}
              placeholder="Search contracts, skills, operatives…"
            />
          </TextField.Root>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <Text size="1" color="gray">
            Popular:
          </Text>
          {POPULAR_SKILLS.map((term) => (
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`}>
              <Badge size="2" color="gray" variant="soft">
                {term}
              </Badge>
            </Link>
          ))}
        </div>
        {!query ? (
          <Text size="2" color="gray">
            Query the files — contracts by title or category, operatives by skill, name, or record.
          </Text>
        ) : null}
      </section>

      {bothEmpty ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--gray-a6)] py-16">
          <img src="/picto-compass.svg" alt="" style={{ height: 72, width: 72 }} className="opacity-80" />
          <Text size="3" weight="bold">
            Nothing in the files.
          </Text>
          <Text size="2" color="gray">
            Try a broader term.
          </Text>
        </div>
      ) : null}

      {query && !bothEmpty ? (
        <>
          <section className="flex flex-col gap-4">
            <Heading size="5">Contracts · {contracts.length}</Heading>
            {contracts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--gray-a6)] py-12">
                <Text size="3" weight="bold">
                  No contracts match
                </Text>
                <Text size="2" color="gray">
                  No active contracts mention &ldquo;{query}&rdquo;.
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contracts.map((t) => (
                  <TaskCard key={t.id} t={t} />
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <Heading size="5">Operatives · {operatives.length}</Heading>
            {operatives.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--gray-a6)] py-12">
                <Text size="3" weight="bold">
                  No operatives match
                </Text>
                <Text size="2" color="gray">
                  No operative lists &ldquo;{query}&rdquo; in their file.
                </Text>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {operatives.map((u) => {
                  const lifetime = lifetimes.get(u.id) ?? 0;
                  return (
                    <Card
                      key={u.id}
                      size="2"
                      variant="surface"
                      render={<Link href={`/operatives/${u.id}`} />}
                      className="transition-colors hover:bg-[var(--gray-a3)]"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Avatar size="3" color="gray" fallback={initials(u.name)} />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <Text size="2" weight="medium" className="leading-snug">
                            {u.name}
                          </Text>
                          <Text size="1" color="gray" className="line-clamp-1">
                            {u.bio}
                          </Text>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {u.skills
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .map((skill) => (
                                <Badge
                                  key={skill}
                                  size="1"
                                  variant="soft"
                                  color={
                                    skill.toLowerCase().includes(query.toLowerCase())
                                      ? "orange"
                                      : "gray"
                                  }
                                >
                                  {skill}
                                </Badge>
                              ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Text size="1" color="gray">
                            {approvalText(u.id)}
                          </Text>
                          {lifetime > 0 ? (
                            <Text size="2" weight="bold" color="success" className="font-mono">
                              {fmtMoney(lifetime)} extracted
                            </Text>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
