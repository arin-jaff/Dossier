import Link from "next/link";
import { Badge, Card, Heading, Text } from "frosted-ui";
import { BalanceShine } from "@/components/balance-shine";
import { VaultCard } from "@/components/vault-card";
import { PageArt } from "@/components/page-art";
import { WithdrawButton } from "@/components/withdraw-button";
import { sql } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { STATUS_COLORS, STATUS_LABELS, fmtMoney, timeAgo } from "@/lib/types";
import type { Submission, Txn } from "@/lib/types";

type RecordRow = Submission & { taskTitle: string; payoutCents: number };
type LedgerRow = Txn & { taskTitle: string | null };

export default async function Earnings() {
  const user = await currentUser();

  const subs = (await sql`SELECT s.*, t.title AS task_title, t.payout_cents
    FROM submissions s JOIN tasks t ON t.id = s.task_id
    WHERE s.earner_id = ${user.id} ORDER BY s.claimed_at DESC`) as unknown as RecordRow[];

  const txns = (await sql`SELECT tx.*, t.title AS task_title
    FROM transactions tx
    LEFT JOIN submissions s ON s.id = tx.submission_id
    LEFT JOIN tasks t ON t.id = s.task_id
    WHERE tx.user_id = ${user.id} ORDER BY tx.created_at DESC`) as unknown as LedgerRow[];

  const lifetime = txns.filter((tx) => tx.kind === "earning").reduce((sum, tx) => sum + tx.amountCents, 0);
  const closed = subs.filter((s) => s.status === "approved").length;
  const pending = subs.filter((s) => s.status === "submitted").reduce((sum, s) => sum + s.payoutCents, 0);

  return (
    <div className="flex flex-col gap-8 pt-10">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--gray-a4)] p-6">
        <PageArt src="/vault-art.png" opacity={0.22} />
        <div className="relative flex flex-col gap-2">
        <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
          Your Vault
        </Text>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <BalanceShine>
              <Text size="9" weight="bold" color="success">
                {fmtMoney(user.balanceCents)}
              </Text>
            </BalanceShine>
            <Text size="2" color="gray">
              Available to extract
            </Text>
          </div>
          <WithdrawButton balanceCents={user.balanceCents} />
        </div>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card size="3" variant="surface">
            <div className="flex flex-col gap-1">
              <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
                Lifetime extracted
              </Text>
              <Text size="7" weight="bold" color="success">
                {fmtMoney(lifetime)}
              </Text>
              <Text size="1" color="gray">
                released to you all-time
              </Text>
            </div>
          </Card>
          <Card size="3" variant="surface">
            <div className="flex flex-col gap-1">
              <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
                Pending clearance
              </Text>
              <Text size="7" weight="bold" color="info">
                {fmtMoney(pending)}
              </Text>
              <Text size="1" color="gray">
                debriefs awaiting review
              </Text>
            </div>
          </Card>
          <Card size="3" variant="surface">
            <div className="flex flex-col gap-1">
              <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
                Contracts closed
              </Text>
              <Text size="7" weight="bold">
                {closed}
              </Text>
              <Text size="1" color="gray">
                approved and paid
              </Text>
            </div>
          </Card>
        </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Heading size="5">Operative record</Heading>
        {subs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--gray-a6)] py-16">
            <Text size="3" weight="bold">
              No contracts on record
            </Text>
            <Text size="2" color="gray">
              Accept a contract from The Board to open your record.
            </Text>
            <Link href="/">
              <Badge size="2" color="orange" variant="soft">
                View The Board
              </Badge>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {subs.map((s) => (
              <Card
                key={s.id}
                size="2"
                variant="surface"
                render={<Link href={`/tasks/${s.taskId}`} />}
                className="transition-colors hover:bg-[var(--gray-a3)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Text size="2" weight="medium" className="leading-snug">
                      {s.taskTitle}
                    </Text>
                    {s.status === "rejected" && s.rejectReason ? (
                      <Text size="1" color="gray">
                        {s.rejectReason}
                      </Text>
                    ) : null}
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

      <section className="flex flex-col gap-4">
        <Heading size="5">Ledger</Heading>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex w-full max-w-xs shrink-0 flex-col gap-2">
            <VaultCard name={user.name} />
            <Text size="1" color="gray" className="text-center uppercase tracking-[0.08em]">
              Extraction destination
            </Text>
          </div>
          <div className="min-w-0 flex-1">
        {txns.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--gray-a6)] py-12">
            <Text size="3" weight="bold">
              No movements yet
            </Text>
            <Text size="2" color="gray">
              Released payouts and extractions appear here.
            </Text>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {txns.map((tx) => (
              <Card key={tx.id} size="2" variant="surface">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Text size="2" weight="medium" className="leading-snug">
                      {tx.kind === "earning" ? (tx.taskTitle ?? "Contract payout") : "Extraction to bank ···· 4242"}
                    </Text>
                  </div>
                  <Text size="1" color="gray">
                    {timeAgo(tx.createdAt)}
                  </Text>
                  <Text
                    size="2"
                    weight="bold"
                    color={tx.kind === "earning" ? "success" : "gray"}
                    className="font-mono"
                  >
                    {tx.kind === "earning" ? "+" : "−"}
                    {fmtMoney(tx.amountCents)}
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        )}
          </div>
        </div>
      </section>
    </div>
  );
}
