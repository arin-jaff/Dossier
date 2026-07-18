import Link from "next/link";
import { Avatar, Badge, Card, Text } from "frosted-ui";
import { CATEGORY_LABELS, daysLeft, fmtMoney, initials } from "@/lib/types";
import type { Category } from "@/lib/types";

export interface FeedTask {
  id: string;
  title: string;
  description: string;
  category: Category;
  payoutCents: number;
  slotsTotal: number;
  taken: number;
  deadlineAt: number;
  posterName: string;
}

export function TaskCard({ t }: { t: FeedTask }) {
  const left = Math.max(0, t.slotsTotal - t.taken);
  return (
    <Card
      size="3"
      variant="surface"
      render={<Link href={`/tasks/${t.id}`} />}
      className="transition-colors hover:bg-[var(--gray-a3)]"
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <Badge color="orange" variant="soft">
            {CATEGORY_LABELS[t.category]}
          </Badge>
          <Text size="1" color="gray" className="font-mono">
            {daysLeft(t.deadlineAt)}
          </Text>
        </div>
        <Text render={<div />} size="3" weight="bold" className="leading-snug">
          {t.title}
        </Text>
        <Text render={<p />} size="2" color="gray" className="line-clamp-2">
          {t.description}
        </Text>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Text size="5" weight="bold" color="success">
            {fmtMoney(t.payoutCents)}
          </Text>
          <div className="flex items-center gap-2">
            <Text size="1" color="gray">
              {left === 0 ? "Fully staffed" : `${left} slot${left === 1 ? "" : "s"} open`}
            </Text>
            <Avatar size="1" color="gray" fallback={initials(t.posterName)} />
          </div>
        </div>
      </div>
    </Card>
  );
}
