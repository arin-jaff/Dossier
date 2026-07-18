import Link from "next/link";
import { Badge, Heading, Text, TextField, Tooltip } from "frosted-ui";
import { ActivityTicker, type TickerItem } from "@/components/activity-ticker";
import { PageArt } from "@/components/page-art";
import { TaskCard, type FeedTask } from "@/components/task-card";
import { sql } from "@/lib/db";
import { CATEGORIES, CATEGORY_LABELS, fmtMoney } from "@/lib/types";
import type { Category } from "@/lib/types";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;
  const category = CATEGORIES.includes(cat as Category) ? (cat as Category) : undefined;

  const rows = (await sql`
    SELECT t.id, t.title, t.description, t.category, t.payout_cents, t.slots_total, t.deadline_at,
      u.name AS poster_name,
      (SELECT count(*)::int FROM submissions s WHERE s.task_id = t.id AND s.status != 'rejected') AS taken
    FROM tasks t
    JOIN users u ON u.id = t.poster_id
    WHERE t.status = 'active'
      ${category ? sql`AND t.category = ${category}` : sql``}
      ${q ? sql`AND (t.title ILIKE ${`%${q}%`} OR t.description ILIKE ${`%${q}%`})` : sql``}
    ORDER BY t.created_at DESC`) as unknown as FeedTask[];

  const [stats] = await sql`SELECT
    (SELECT coalesce(sum(payout_cents * slots_total), 0)::int FROM tasks WHERE status = 'active') AS available,
    (SELECT count(*)::int FROM tasks WHERE status = 'active') AS open,
    (SELECT coalesce(sum(amount_cents), 0)::int FROM transactions WHERE kind = 'earning') AS paid`;

  const issued = (await sql`SELECT t.title, t.payout_cents, t.slots_total, t.created_at, u.name
    FROM tasks t JOIN users u ON u.id = t.poster_id
    ORDER BY t.created_at DESC LIMIT 5`) as unknown as {
    title: string;
    payoutCents: number;
    slotsTotal: number;
    createdAt: number;
    name: string;
  }[];

  const earnings = (await sql`SELECT tx.amount_cents, tx.created_at, u.name, t.title
    FROM transactions tx
    JOIN users u ON u.id = tx.user_id
    JOIN submissions s ON s.id = tx.submission_id
    JOIN tasks t ON t.id = s.task_id
    WHERE tx.kind = 'earning'
    ORDER BY tx.created_at DESC LIMIT 5`) as unknown as {
    amountCents: number;
    createdAt: number;
    name: string;
    title: string;
  }[];

  const tickerItems: TickerItem[] = [
    ...issued.map((r) => ({
      who: r.name,
      verb: "contracted out",
      title: `"${r.title}"`,
      money: `${fmtMoney(r.payoutCents)}/slot`,
      ts: Number(r.createdAt),
    })),
    ...earnings.map((r) => ({
      who: r.name,
      verb: "extracted",
      title: `— "${r.title}"`,
      money: fmtMoney(r.amountCents),
      ts: Number(r.createdAt),
    })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-8 pt-10">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--gray-a4)] p-6">
        <PageArt src="/board-art.png" />
        <div className="relative flex flex-col gap-3">
        <Heading size="8">The Board.</Heading>
        <Text render={<p />} size="4" color="gray">
          Handlers issue contracts. Operatives execute. Your Vault pays out.
        </Text>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Tooltip content="Total payout × open slots across every active contract">
            <Badge size="2" color="success" variant="soft">
              {fmtMoney(stats.available)} on the board
            </Badge>
          </Tooltip>
          <Badge size="2" color="gray" variant="soft">
            {stats.open} open contracts
          </Badge>
          <Badge size="2" color="gray" variant="soft">
            {fmtMoney(stats.paid)} extracted by operatives
          </Badge>
        </div>
        <ActivityTicker items={tickerItems} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form action="/search" className="w-full max-w-sm">
            {category ? <input type="hidden" name="cat" value={category} /> : null}
            <TextField.Root size="3">
              <TextField.Input name="q" placeholder="Search contracts…" defaultValue={q ?? ""} />
            </TextField.Root>
          </form>
          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Badge size="2" variant={category ? "soft" : "solid"} color={category ? "gray" : "orange"}>
                All
              </Badge>
            </Link>
            {CATEGORIES.map((c) => (
              <Link key={c} href={`/?cat=${c}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
                <Badge size="2" variant={category === c ? "solid" : "soft"} color={category === c ? "orange" : "gray"}>
                  {CATEGORY_LABELS[c]}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--gray-a6)] py-16">
            <Text size="3" weight="bold">
              No contracts match
            </Text>
            <Text size="2" color="gray">
              Adjust the search or category and re-run the query.
            </Text>
            <Link href="/">
              <Badge size="2" variant="soft" color="orange">
                Clear filters
              </Badge>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((t) => (
              <TaskCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
