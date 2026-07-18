"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Avatar, Badge, Button, TabsNav } from "frosted-ui";
import { logout } from "@/lib/actions";
import { fmtMoney, initials } from "@/lib/types";
import type { User } from "@/lib/types";

export function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  const links = [
    { href: "/", label: "The Board" },
    { href: "/dashboard", label: "Console" },
    { href: "/earnings", label: "Your Vault" },
    { href: "/how", label: "Protocol" },
  ];

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--gray-a5)] bg-[var(--color-background)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-5 px-4">
        <Link href={user ? "/" : "/login"} className="flex items-center gap-2">
          <img src="/whop-mark.svg" alt="Whop" width={39} height={20} style={{ height: 20, width: "auto" }} />
          <span className="text-[17px] font-bold tracking-tight">Dossier.</span>
        </Link>
        {user ? (
          <>
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
              <Link
                href={`/operatives/${user.id}`}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <Avatar size="1" color="orange" fallback={initials(user.name)} />
                <span className="hidden text-sm font-medium md:inline">{user.name.split(" ")[0]}</span>
              </Link>
              <Button
                size="2"
                variant="ghost"
                color="gray"
                loading={busy}
                onClick={() =>
                  startTransition(async () => {
                    await logout();
                  })
                }
              >
                Sign out
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
