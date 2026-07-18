"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Badge, Button, Callout, Card, Separator, Text, TextArea, TextField, toast } from "frosted-ui";
import { claimTask, submitProof } from "@/lib/actions";
import { fmtMoney, timeAgo } from "@/lib/types";
import type { Submission } from "@/lib/types";

interface Props {
  taskId: string;
  payoutCents: number;
  slotsLeft: number;
  slotsTotal: number;
  deadline: string;
  isOwner: boolean;
  taskStatus: string;
  pendingCount: number;
  mine: Submission | null;
}

export function ActionPanel(p: Props) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  const claim = () =>
    startTransition(async () => {
      const res = await claimTask(p.taskId);
      if (res?.error) toast.error(res.error);
      else toast.success("Contract accepted. File your debrief before the deadline.");
    });

  const submit = (form: FormData) =>
    startTransition(async () => {
      const res = await submitProof(p.taskId, form);
      if (res?.error) toast.error(res.error);
      else toast.success("Debrief filed. Payment extracts on approval.");
    });

  return (
    <Card size="4" variant="surface" className="lg:sticky lg:top-20">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <Text size="1" color="gray">
            Payout per approved debrief
          </Text>
          <Text size="7" weight="bold" color="success">
            {fmtMoney(p.payoutCents)}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={p.slotsLeft > 0 ? "orange" : "gray"} variant="soft">
            {p.slotsLeft} of {p.slotsTotal} slots left
          </Badge>
          <Badge color="gray" variant="soft">
            {p.deadline}
          </Badge>
        </div>
        <Separator size="4" />

        {p.isOwner ? (
          <div className="flex flex-col gap-3">
            <Text size="2" color="gray">
              You issued this contract. {p.pendingCount} debrief{p.pendingCount === 1 ? "" : "s"} awaiting review.
            </Text>
            <Button size="3" variant="classic" onClick={() => router.push("/dashboard")}>
              Review debriefs
            </Button>
          </div>
        ) : p.mine?.status === "approved" ? (
          <Callout.Root color="success">
            <Callout.Title>Closed — {fmtMoney(p.payoutCents)} extracted</Callout.Title>
            <Callout.Description>
              Approved {p.mine.reviewedAt ? timeAgo(p.mine.reviewedAt) : ""}. Funds released to{" "}
              <Link href="/earnings" className="underline">
                your Vault
              </Link>
              .
            </Callout.Description>
          </Callout.Root>
        ) : p.mine?.status === "submitted" ? (
          <Callout.Root color="info">
            <Callout.Title>Debrief in review</Callout.Title>
            <Callout.Description>
              Filed {p.mine.submittedAt ? timeAgo(p.mine.submittedAt) : ""}. Payment extracts the moment it&apos;s
              approved.
            </Callout.Description>
          </Callout.Root>
        ) : p.mine?.status === "rejected" ? (
          <Callout.Root color="danger">
            <Callout.Title>Declined</Callout.Title>
            <Callout.Description>{p.mine.rejectReason ?? "Didn't meet the deliverables."}</Callout.Description>
          </Callout.Root>
        ) : p.mine?.status === "claimed" ? (
          <form action={submit} className="flex flex-col gap-3">
            <Text size="2" weight="medium">
              File your debrief
            </Text>
            <TextField.Root size="2">
              <TextField.Input name="proofUrl" placeholder="Link to deliverables (Drive, Loom, TikTok…)" />
            </TextField.Root>
            <TextArea name="proofText" placeholder="Anything your Handler should know…" rows={4} />
            <Button size="3" variant="classic" type="submit" loading={busy}>
              File debrief
            </Button>
            <Text size="1" color="gray">
              Your Handler reviews the debrief. Approval releases {fmtMoney(p.payoutCents)} to your Vault.
            </Text>
          </form>
        ) : p.taskStatus !== "active" || p.slotsLeft === 0 ? (
          <Callout.Root color="gray">
            <Callout.Title>Contract fully staffed</Callout.Title>
            <Callout.Description>Check back — declined debriefs reopen slots.</Callout.Description>
          </Callout.Root>
        ) : (
          <div className="flex flex-col gap-2">
            <Button size="3" variant="classic" onClick={claim} loading={busy}>
              Accept contract
            </Button>
            <Text size="1" color="gray">
              Free to accept. Deliver, get approved, and {fmtMoney(p.payoutCents)} extracts to your Vault.
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
