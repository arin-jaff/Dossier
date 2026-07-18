import Link from "next/link";
import { Badge, Card, Heading, Separator, Text } from "frosted-ui";

const STEPS = [
  {
    n: "01",
    title: "Issue",
    line: "A Handler posts a contract and commits the budget up front.",
    money: "Committed",
    color: "orange" as const,
  },
  {
    n: "02",
    title: "Accept",
    line: "An operative claims a slot. Free to accept, no interviews.",
    money: "In escrow",
    color: "gray" as const,
  },
  {
    n: "03",
    title: "Deliver",
    line: "The work gets done and a debrief is filed with deliverables.",
    money: "In review",
    color: "info" as const,
  },
  {
    n: "04",
    title: "Approve",
    line: "The Handler reviews the debrief. Approval releases the payout.",
    money: "Released",
    color: "success" as const,
  },
  {
    n: "05",
    title: "Extract",
    line: "Money lands in the operative's Vault, ready to extract.",
    money: "Paid out",
    color: "success" as const,
  },
];

const MONEY_RULES = [
  {
    title: "Payout × slots = total exposure",
    line: "Every contract shows its full budget before anyone commits a minute.",
  },
  {
    title: "Funds move on approval only",
    line: "No approved debrief, no charge. The Handler stays in control.",
  },
  {
    title: "Declined work costs nothing",
    line: "A declined debrief reopens the slot automatically. Zero waste.",
  },
];

const WINNERS = [
  {
    who: "Handlers",
    lines: ["Work delivered on demand, without hiring.", "Pay only for output you approve.", "Scale one task to twenty operatives."],
  },
  {
    who: "Operatives",
    lines: ["Real payouts, not exposure.", "No interviews — accept and execute.", "Every closed contract compounds your record."],
  },
  {
    who: "Whop",
    lines: ["A reason to come back every day.", "Money earned stays in the ecosystem.", "Every visitor can earn before they spend."],
  },
];

export default function HowPage() {
  return (
    <div className="flex flex-col gap-10 pt-10">
      <section className="flex flex-col gap-2">
        <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
          The Protocol
        </Text>
        <Heading size="8">How Dossier works.</Heading>
        <Text render={<p />} size="4" color="gray">
          One loop. Five steps. Money only moves when work is approved.
        </Text>
      </section>

      <section className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        {STEPS.map((s, i) => (
          <div key={s.n} className="contents">
            {i > 0 ? (
              <Text size="4" color="gray" className="self-center px-1 py-1 lg:py-0">
                <span className="hidden lg:inline">→</span>
                <span className="lg:hidden">↓</span>
              </Text>
            ) : null}
            <Card size="3" variant="surface" className="flex-1">
              <div className="flex h-full flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Text size="1" color="gray" className="font-mono">
                    {s.n}
                  </Text>
                  <Badge size="1" color={s.color} variant="soft">
                    {s.money}
                  </Badge>
                </div>
                <Text size="3" weight="bold">
                  {s.title}
                </Text>
                <Text render={<p />} size="1" color="gray">
                  {s.line}
                </Text>
              </div>
            </Card>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <Heading size="4">How the money works</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MONEY_RULES.map((r) => (
            <Card key={r.title} size="3" variant="surface">
              <div className="flex flex-col gap-2">
                <Text size="2" weight="bold">
                  {r.title}
                </Text>
                <Text render={<p />} size="2" color="gray">
                  {r.line}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Heading size="4">Everyone wins</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {WINNERS.map((w) => (
            <Card key={w.who} size="3" variant="surface">
              <div className="flex flex-col gap-3">
                <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
                  {w.who}
                </Text>
                <div className="flex flex-col gap-1.5">
                  {w.lines.map((l) => (
                    <Text key={l} render={<p />} size="2" color="gray">
                      {l}
                    </Text>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Separator size="4" />

      <section className="flex flex-wrap items-center gap-3 pb-4">
        <Text size="3" weight="medium">
          The Board is live.
        </Text>
        <Link href="/">
          <Badge size="2" color="orange" variant="solid">
            Browse The Board
          </Badge>
        </Link>
        <Link href="/create">
          <Badge size="2" color="orange" variant="soft">
            Issue a contract
          </Badge>
        </Link>
      </section>
    </div>
  );
}
