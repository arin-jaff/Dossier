"use client";

import { useTransition } from "react";
import { Button, toast } from "frosted-ui";
import { withdraw } from "@/lib/actions";

export function WithdrawButton({ balanceCents }: { balanceCents: number }) {
  const [busy, startTransition] = useTransition();

  return (
    <Button
      size="3"
      variant="classic"
      disabled={balanceCents <= 0}
      loading={busy}
      onClick={() =>
        startTransition(async () => {
          await withdraw();
          toast.success("Extraction initiated — funds arrive in 1–2 business days (simulated).");
        })
      }
    >
      Extract funds
    </Button>
  );
}
