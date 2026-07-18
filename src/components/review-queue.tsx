"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar, Badge, Button, Card, Text, TextField, toast } from "frosted-ui";
import { approveSubmission, rejectSubmission } from "@/lib/actions";
import { fmtMoney, initials, timeAgo } from "@/lib/types";

export interface QueueItem {
  id: string;
  taskId: string;
  taskTitle: string;
  payoutCents: number;
  earnerName: string;
  proofText: string | null;
  proofUrl: string | null;
  submittedAt: number;
}

export function ReviewQueue({ items }: { items: QueueItem[] }) {
  const [busy, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--gray-a6)] py-12">
        <Text size="3" weight="bold">
          No debriefs pending
        </Text>
        <Text size="2" color="gray">
          Debriefs land here the moment operatives file them.
        </Text>
      </div>
    );
  }

  const approve = (item: QueueItem) =>
    startTransition(async () => {
      await approveSubmission(item.id);
      toast.success(`Debrief approved — ${fmtMoney(item.payoutCents)} released to ${item.earnerName}`);
    });

  const confirmReject = (item: QueueItem) =>
    startTransition(async () => {
      await rejectSubmission(item.id, reason);
      toast("Declined — the slot reopened.");
      setRejecting(null);
      setReason("");
    });

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <Card key={item.id} size="3" variant="surface">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Avatar size="2" color="gray" fallback={initials(item.earnerName)} />
              <Text size="2" weight="medium">
                {item.earnerName}
              </Text>
              <Text size="1" color="gray">
                {timeAgo(item.submittedAt)} ·
              </Text>
              <Link href={`/tasks/${item.taskId}`}>
                <Text size="1" color="gray" className="underline">
                  {item.taskTitle}
                </Text>
              </Link>
              <span className="ml-auto">
                <Badge size="2" color="success" variant="soft">
                  {fmtMoney(item.payoutCents)}
                </Badge>
              </span>
            </div>
            {item.proofUrl ? (
              <a href={item.proofUrl} target="_blank" rel="noreferrer">
                <Text size="2" color="orange" className="underline">
                  View deliverables ↗
                </Text>
              </a>
            ) : null}
            {item.proofText ? (
              <Text render={<p />} size="2" color="gray" className="line-clamp-3 whitespace-pre-line">
                {item.proofText}
              </Text>
            ) : null}
            {rejecting === item.id ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <TextField.Root size="2">
                    <TextField.Input
                      placeholder="Why is this declined? The operative sees this."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </TextField.Root>
                </div>
                <div className="flex gap-2">
                  <Button size="2" variant="classic" color="danger" loading={busy} onClick={() => confirmReject(item)}>
                    Confirm decline
                  </Button>
                  <Button size="2" variant="soft" color="gray" onClick={() => setRejecting(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="2" variant="classic" color="success" loading={busy} onClick={() => approve(item)}>
                  Approve &amp; release {fmtMoney(item.payoutCents)}
                </Button>
                <Button size="2" variant="soft" color="danger" onClick={() => setRejecting(item.id)}>
                  Decline
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
