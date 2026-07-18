"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button, toast } from "frosted-ui";
import { claimTask } from "@/lib/actions";

export function AcceptButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  return (
    <Button
      size="2"
      variant="classic"
      loading={busy}
      onClick={() =>
        startTransition(async () => {
          const res = await claimTask(taskId);
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success("Contract accepted. File your debrief from the contract page.");
          }
          router.refresh();
        })
      }
    >
      Accept contract
    </Button>
  );
}
