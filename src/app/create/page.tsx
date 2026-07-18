import { Button, Card, Heading, Select, Text, TextArea, TextField } from "frosted-ui";
import { createTask } from "@/lib/actions";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

export default function CreatePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-10">
      <div className="flex flex-col gap-2">
        <Text size="1" color="gray" className="uppercase tracking-[0.08em]">
          Handler console
        </Text>
        <Heading size="7">Issue a contract</Heading>
        <Text render={<p />} size="3" color="gray">
          Put money behind the work. You only pay for debriefs you approve.
        </Text>
      </div>
      <Card size="4" variant="surface">
        <form action={createTask} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <Text size="2" weight="medium">
              Contract title
            </Text>
            <TextField.Root size="3">
              <TextField.Input name="title" required placeholder="e.g. Clip my podcast into viral TikToks" />
            </TextField.Root>
          </label>

          <div className="flex flex-col gap-2">
            <Text size="2" weight="medium">
              Category
            </Text>
            <Select.Root name="category" defaultValue="content" size="3">
              <Select.Trigger />
              <Select.Content>
                {CATEGORIES.map((c) => (
                  <Select.Item key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2">
              <Text size="2" weight="medium">
                Payout per operative
              </Text>
              <TextField.Root size="3">
                <TextField.Slot>
                  <Text size="2" color="gray">
                    $
                  </Text>
                </TextField.Slot>
                <TextField.Input name="payout" type="number" min="1" step="0.01" required placeholder="25" />
              </TextField.Root>
            </label>
            <label className="flex flex-col gap-2">
              <Text size="2" weight="medium">
                Operative slots
              </Text>
              <TextField.Root size="3">
                <TextField.Input name="slots" type="number" min="1" step="1" defaultValue="1" required />
              </TextField.Root>
            </label>
            <label className="flex flex-col gap-2">
              <Text size="2" weight="medium">
                Deadline (days)
              </Text>
              <TextField.Root size="3">
                <TextField.Input name="deadline" type="number" min="1" step="1" defaultValue="7" required />
              </TextField.Root>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <Text size="2" weight="medium">
              The brief
            </Text>
            <TextArea
              name="description"
              rows={5}
              required
              placeholder="What needs to get done, context, and what great work looks like…"
            />
          </label>

          <label className="flex flex-col gap-2">
            <Text size="2" weight="medium">
              Deliverables
            </Text>
            <TextArea name="requirements" rows={4} placeholder={"One per line, e.g.\n- 9:16 vertical, 1080p+\n- Submit a Drive link"} />
          </label>

          <div className="flex flex-col gap-3">
            <Button size="3" variant="classic" type="submit">
              Issue contract
            </Button>
            <Text size="1" color="gray">
              Each approved debrief releases the payout. Total exposure = payout × slots. Declined debriefs cost nothing.
            </Text>
          </div>
        </form>
      </Card>
    </div>
  );
}
