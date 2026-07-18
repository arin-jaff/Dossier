import type { Metadata } from "next";
import "./globals.css";
import "frosted-ui/styles.css";
import { Theme, Toaster } from "frosted-ui";
import { Navbar } from "@/components/navbar";
import { currentUser, listPersonas } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dossier — the contract board on Whop",
  description:
    "A task marketplace on Whop. Handlers issue paid contracts. Operatives complete them, file a debrief, and extract the payout.",
  icons: { icon: "/whop-mark.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, personas] = await Promise.all([currentUser(), listPersonas()]);
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
          <Navbar user={user} personas={personas} />
          <main className="mx-auto w-full max-w-6xl px-4 pb-20">{children}</main>
          <Toaster />
        </Theme>
      </body>
    </html>
  );
}
