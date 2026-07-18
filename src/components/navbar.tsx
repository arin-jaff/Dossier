"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Avatar, Badge, Button, DropdownMenu, TabsNav, Text, toast } from "frosted-ui";
import { switchPersona } from "@/lib/actions";
import { fmtMoney, initials } from "@/lib/types";
import type { User } from "@/lib/types";

export function Navbar({ user, personas }: { user: User; personas: User[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const links = [
    { href: "/", label: "The Board" },
    { href: "/dashboard", label: "Console" },
    { href: "/earnings", label: "The Vault" },
    { href: "/how", label: "Protocol" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--gray-a5)] bg-[var(--color-background)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-5 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FA4616] text-[15px] font-black text-white">
            W
          </span>
          <span className="text-[17px] font-bold tracking-tight">Dossier</span>
        </Link>
        <nav className="hidden sm:block">
          <TabsNav.Root size="2">
            {links.map((l) => (
              <TabsNav.Link key={l.href} active={pathname === l.href} render={<Link href={l.href} />}>
                {l.label}
              </TabsNav.Link>
            ))}
          </TabsNav.Root>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Button size="2" variant="classic" onClick={() => router.push("/create")}>
            Issue contract
          </Button>
          <Link href="/earnings">
            <Badge size="2" color="success" variant="soft">
              {fmtMoney(user.balanceCents)}
            </Badge>
          </Link>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button size="2" variant="ghost" color="gray">
                <Avatar size="1" color="orange" fallback={initials(user.name)} />
                <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Group>
                <DropdownMenu.GroupLabel>Identities</DropdownMenu.GroupLabel>
              {personas.map((p) => (
                <DropdownMenu.Item
                  key={p.id}
                  onClick={() =>
                    startTransition(async () => {
                      await switchPersona(p.id);
                      toast(`Identity switched: ${p.name}`);
                    })
                  }
                >
                  <span className="flex items-center gap-2">
                    <Avatar size="1" color={p.id === user.id ? "orange" : "gray"} fallback={initials(p.name)} />
                    <span>{p.name}</span>
                    {p.id === user.id ? (
                      <Text size="1" color="gray">
                        current
                      </Text>
                    ) : null}
                  </span>
                </DropdownMenu.Item>
              ))}
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
