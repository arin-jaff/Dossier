"use client";

import { useRef, useTransition } from "react";
import { Badge, Button, Card, Text, TextField } from "frosted-ui";
import { addCredential, removeCredential } from "@/lib/actions";

export interface CredentialItem {
  id: string;
  title: string;
  issuer: string | null;
  url: string | null;
  added: string;
}

export function CredentialsEditor({ items, editable }: { items: CredentialItem[]; editable: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && !editable ? (
        <Text size="2" color="gray">
          No credentials on file.
        </Text>
      ) : null}
      {items.map((c) => (
        <Card key={c.id} size="2" variant="surface">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <Text size="2" weight="medium">
                {c.title}
              </Text>
              {c.issuer ? (
                <Text size="1" color="gray">
                  {c.issuer}
                </Text>
              ) : null}
            </div>
            {c.url ? (
              <a href={c.url} target="_blank" rel="noreferrer">
                <Text size="1" color="orange" className="underline">
                  View ↗
                </Text>
              </a>
            ) : null}
            <Badge size="1" color="gray" variant="soft">
              Added {c.added}
            </Badge>
            {editable ? (
              <Button
                size="1"
                variant="soft"
                color="danger"
                loading={busy}
                onClick={() =>
                  startTransition(async () => {
                    await removeCredential(c.id);
                  })
                }
              >
                Remove
              </Button>
            ) : null}
          </div>
        </Card>
      ))}
      {editable ? (
        <Card size="3" variant="surface">
          <form
            ref={formRef}
            action={(fd) =>
              startTransition(async () => {
                await addCredential(fd);
                formRef.current?.reset();
              })
            }
            className="flex flex-col gap-3"
          >
            <Text size="2" weight="medium">
              Add a credential
            </Text>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField.Root size="2">
                <TextField.Input name="title" required placeholder="Certification or credential title" />
              </TextField.Root>
              <TextField.Root size="2">
                <TextField.Input name="issuer" placeholder="Issuer (e.g. Adobe, Whop)" />
              </TextField.Root>
            </div>
            <TextField.Root size="2">
              <TextField.Input name="url" type="url" placeholder="Link to the certificate (Drive, Credly…)" />
            </TextField.Root>
            <div>
              <Button size="2" variant="classic" type="submit" loading={busy}>
                Add credential
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
