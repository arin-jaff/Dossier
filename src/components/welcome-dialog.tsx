"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Dialog, Text } from "frosted-ui";

const FLOWS = [
  {
    goal: "You're here to earn",
    steps: ["Browse The Board", "Accept a contract, file your debrief", "Get approved — extract from your Vault"],
  },
  {
    goal: "You're here to hire",
    steps: ["Issue a contract — payout × slots", "Review debriefs in the Console", "Approve to release payouts"],
  },
];

export function WelcomeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const close = (next?: string) => {
    document.cookie = "wt_seen=1; path=/; max-age=31536000";
    setOpen(false);
    if (next) router.push(next);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) close();
      }}
    >
      <Dialog.Content style={{ maxWidth: 580 }}>
        <div className="flex flex-col gap-1">
          <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
            The Protocol
          </Text>
          <Dialog.Title>Welcome to Dossier.</Dialog.Title>
          <Dialog.Description>
            The contract board on Whop — work with real money behind it, paid the moment it&apos;s approved.
          </Dialog.Description>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FLOWS.map((f) => (
            <div key={f.goal} className="flex flex-col gap-2 rounded-lg border border-[var(--gray-a5)] p-3">
              <Text size="1" color="orange" className="uppercase tracking-[0.08em]">
                {f.goal}
              </Text>
              <div className="flex flex-col gap-1.5">
                {f.steps.map((s, i) => (
                  <div key={s} className="flex gap-2">
                    <Text size="1" color="gray" className="font-mono">
                      0{i + 1}
                    </Text>
                    <Text size="1" color="gray">
                      {s}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <Button size="2" variant="soft" color="gray" onClick={() => close("/how")}>
            Read the full Protocol
          </Button>
          <Button size="2" variant="classic" onClick={() => close()}>
            Enter The Board
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
