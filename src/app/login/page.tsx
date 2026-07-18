import { Button, Callout, Card, Heading, Text, TextField } from "frosted-ui";
import { login } from "@/lib/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto grid w-full max-w-4xl items-center gap-10 pt-14 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
            Restricted access
          </Text>
          <Heading size="8">Clock in.</Heading>
          <Text render={<p />} size="3" color="gray">
            The contract board on Whop. Work with money behind it.
          </Text>
        </div>
        {error ? (
          <Callout.Root color="danger">
            <Callout.Title>Access denied</Callout.Title>
            <Callout.Description>Check your credentials and try again.</Callout.Description>
          </Callout.Root>
        ) : null}
        <Card size="4" variant="surface">
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
        <Text size="1" color="gray">
          Demo access — alex@dossier.app · sam@dossier.app · jordan@dossier.app · password: operative
        </Text>
      </div>
      <div className="hidden lg:block">
        <img
          src="/dossier-key-art.png"
          alt=""
          className="h-[540px] w-full rounded-2xl border border-[var(--gray-a5)] object-cover"
        />
      </div>
    </div>
  );
}
