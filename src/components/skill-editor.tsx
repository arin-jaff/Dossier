"use client";

import { useRef, useTransition } from "react";
import { Badge, Button, TextField } from "frosted-ui";
import { addSkill, removeSkill } from "@/lib/actions";

export function SkillEditor({ skills, editable }: { skills: string[]; editable: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, startTransition] = useTransition();

  if (!editable) {
    if (!skills.length) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        {skills.map((s) => (
          <Badge key={s} color="gray" variant="soft">
            {s}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {skills.map((s) => (
        <Badge key={s} color="gray" variant="soft">
          <span className="flex items-center gap-1.5">
            {s}
            <button
              type="button"
              aria-label={`Remove ${s}`}
              className="cursor-pointer opacity-50 transition-opacity hover:opacity-100"
              onClick={() =>
                startTransition(async () => {
                  await removeSkill(s);
                })
              }
            >
              ✕
            </button>
          </span>
        </Badge>
      ))}
      <form
        ref={formRef}
        action={(fd) =>
          startTransition(async () => {
            await addSkill(fd);
            formRef.current?.reset();
          })
        }
        className="flex items-center gap-2"
      >
        <TextField.Root size="1">
          <TextField.Input name="skill" placeholder="Add a skill…" />
        </TextField.Root>
        <Button size="1" variant="soft" type="submit" loading={busy}>
          Add
        </Button>
      </form>
    </div>
  );
}
