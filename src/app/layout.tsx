import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import "frosted-ui/styles.css";
import { Theme, Toaster } from "frosted-ui";
import { Navbar } from "@/components/navbar";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { sessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dossier. — the contract board on Whop",
  description:
    "A task marketplace on Whop. Handlers issue paid contracts. Operatives complete them, file a debrief, and extract the payout.",
  icons: { icon: "/whop-mark.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, store] = await Promise.all([sessionUser(), cookies()]);
  const seenWelcome = store.get("wt_seen")?.value === "1";
  return (
    <html lang="en" className="h-full antialiased dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body className="min-h-full">
        <Theme
          appearance="dark"
          grayColor="gray"
          accentColor="orange"
          successColor="green"
          dangerColor="red"
          warningColor="amber"
          infoColor="sky"
        >
          <Navbar user={user} />
          <main className="mx-auto w-full max-w-6xl px-4 pb-20">{children}</main>
          {user && !seenWelcome ? <WelcomeDialog /> : null}
          <Toaster />
        </Theme>
      </body>
    </html>
  );
}
