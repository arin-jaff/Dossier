import { Button, Callout, Card, Text, TextField } from "frosted-ui";
import { login } from "@/lib/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="fixed inset-0 z-50">
      <img src="/dossier-key-art.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-7 px-4">
        <div className="flex flex-col items-center gap-4">
          <img src="/whop-mark.svg" alt="Whop" style={{ height: 48, width: "auto" }} />
          <span className="text-6xl font-black tracking-tight">Dossier.</span>
          <Text size="1" color="gray" className="uppercase tracking-[0.3em]">
            Clock in
          </Text>
        </div>
        {error ? (
          <div className="w-full">
            <Callout.Root color="danger">
              <Callout.Title>Access denied</Callout.Title>
              <Callout.Description>Check your credentials and try again.</Callout.Description>
            </Callout.Root>
          </div>
        ) : null}
        <Card size="4" variant="surface" className="w-full">
          <form action={login} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <Text size="2" weight="medium">
                Email
              </Text>
              <TextField.Root size="3">
                <TextField.Input name="email" type="email" required placeholder="alex@dossier.app" />
              </TextField.Root>
            </label>
            <label className="flex flex-col gap-2">
              <Text size="2" weight="medium">
                Password
              </Text>
              <TextField.Root size="3">
                <TextField.Input name="password" type="password" required placeholder="••••••••" />
              </TextField.Root>
            </label>
            <Button size="3" variant="classic" type="submit">
              Sign in
            </Button>
          </form>
        </Card>
        <Text size="1" color="gray" className="text-center">
          Demo access — alex@dossier.app · jordan@dossier.app · sam@dossier.app · password: operative
        </Text>
      </div>
    </div>
  );
}
