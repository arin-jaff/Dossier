# Dossier — full demo script (Handler + Contractor)

A scene-by-scene walkthrough that plays both sides of the marketplace in one browser, with an architecture aside after each new element so a technical audience gets the "how" along with the "what." Each scene has **SAY** (narration), **DO** (click path), and **ARCHITECTURE** (what's actually happening server-side).

## Cast

- **Sam Chen** — the Handler. `sam@dossier.app` / `operative`. Runs Chen Trading Academy, already has ~10 contracts live on the board.
- **Alex Rivera** — the Contractor (Operative). `alex@dossier.app` / `operative`. Clipper/video editor, skills tagged `video editing, clipping, ugc, captions`.
- Password for every demo account: **`operative`**.

## One-time setup before you start

- Dev server running (`pnpm dev`), fresh browser state — log out or open a private window so the cold open actually hits `/login`.
- Have this contract's fields ready to type — you'll post it live as Sam:
  - **Title:** `Clip our demo day highlight reel`
  - **Category:** Video
  - **Payout per operative:** `60`
  - **Slots:** `2`
  - **Deadline:** `5`
  - **Brief:** `We just wrapped a live product demo and need it cut into shareable clips. Looking for someone comfortable with clipping and burned-in captions — send us your best cut.`
  - **Deliverables:** `- 60-90 second vertical cut\n- Burned-in captions\n- Submit a Drive or TikTok link`
  - (The words "clipping" and "captions" are load-bearing — they're what makes this contract auto-surface later as a skill match for Alex. Don't paraphrase them out.)

---

## Scene 1 — Cold open: the login screen

**DO:** Load the app logged out. It redirects straight to `/login`.

**SAY:** "This is Dossier — a task marketplace built for Whop's 'Whop Tasks' prompt. The pitch: some people come to Whop to run a business, some come to earn. Dossier is a two-sided contract board — businesses, called Handlers, post paid work; anyone, an Operative, can accept it, deliver, and get paid the moment it's approved. It's themed as a spy-noir contract board — issue a contract, file a debrief, extract your payout — but every component on this screen is Whop's real design system, not a skin."

**ARCHITECTURE:** This app has no separate backend — it's a single Next.js 16 app where server components query Postgres directly and server actions handle every write. Getting here at all is itself the auth story: `src/proxy.ts` is Next.js 16's replacement for the old `middleware.ts` file (worth knowing cold if asked — it's a real breaking rename in this version), and it checks for a `wt_user` cookie on every request. No cookie, no matter what page you asked for, you land on `/login`. There's no session table, no JWT, no third-party auth provider — just a cookie holding a user id, which is enough for a hackathon demo and nothing more.

---

## Scene 2 — Sam logs in, the welcome dialog

**DO:** Log in as `sam@dossier.app` / `operative`. A "Welcome to Dossier." modal appears with two columns — "You're here to earn" and "You're here to hire" — each with 3 numbered steps, and two buttons: "Read the full Protocol" and "Enter The Board." Click **Enter The Board**.

**SAY:** "First login only, you get a 60-second tour of both roles. Sam here runs a trading education community on Whop — she's the Handler for this walkthrough."

**ARCHITECTURE:** This dialog is gated on a second cookie, `wt_seen`, set client-side the moment you dismiss it — not tied to the user account at all. That means if I log out and log back in as Alex in this same browser, you will *not* see it again, because the browser already has `wt_seen`, even though Alex has never logged in before. Small detail, but it's the kind of thing worth flagging live so it reads as "known behavior," not a bug.

---

## Scene 3 — The Board

**DO:** Land on `/`. Point out the hero stats badges (total payout on the board, open contract count, lifetime extracted by operatives) and the scrolling activity ticker underneath.

**SAY:** "This is the Board — the feed. Every number you see here, including that ticker of who just got contracted or paid, is a live read off the same Postgres tables. Nothing on this page is hardcoded."

**ARCHITECTURE:** The whole feed is one async server component: it runs a handful of tagged-template SQL queries directly (`postgres.js`, no ORM), joins tasks to posters and a live submission-count subquery for slots-left, and streams the result as HTML. The activity ticker is fed by two more queries — recent task postings and recent approved payouts — merged and sorted client-side by timestamp. There's no cache layer and no separate API route; the database round-trip *is* the page load.

---

## Scene 4 — Sam issues a contract

**DO:** Click **Issue contract** in the navbar → `/create`. Fill in the fields from the setup box above. Submit.

**SAY:** "Sam needs her demo-day footage clipped. She sets a payout per operative and a slot count — that product of the two is her total exposure, shown right on the form before she commits to anything."

**ARCHITECTURE:** The form posts straight to a Next.js **server action** (`createTask` in `lib/actions.ts`) — there's no client-side fetch, no JSON API to hand-roll. The action validates, inserts one row into `tasks`, calls `revalidatePath` to invalidate every server component that reads task data, and redirects to the new contract's page. That redirect is also proof it's real: you're about to land on a URL for a task that didn't exist five seconds ago.

---

## Scene 5 — It's live

**DO:** You're redirected to the new contract's `/tasks/[id]` page. Then navigate back to `/` — the new contract is the top card (newest first).

**SAY:** "And it's already the first thing anyone sees on the Board — that's a real database write you just watched happen, not a staged screenshot."

---

## Scene 6 — Handler Console

**DO:** Click **Console** in the navbar → `/dashboard`.

**SAY:** "This is Sam's side of the business — her issued contracts and her review queue. And this isn't an empty demo state — she's already got real debriefs waiting from earlier activity on the board."

**ARCHITECTURE:** The review queue is one query: every `submitted` submission joined back to its task and earner, scoped to `poster_id = current user`, oldest-first. There's no separate moderation service or admin panel — a Handler's queue is just a filtered view of the same `submissions` table an Operative writes to.

*(Don't act on any of these yet — we're coming back to this exact screen once Alex's debrief lands in it.)*

---

## Scene 7 — Switch identities: log out, log in as Alex

**DO:** **Sign out** → redirects to `/login`. Log in as `alex@dossier.app` / `operative`. No welcome dialog this time (see Scene 2's note — same browser, cookie already set).

**SAY:** "Now I'm Alex — a working operative on the platform, not a persona switcher, an actual separate login. This is the other side of the exact same marketplace."

---

## Scene 8 — Alex's dashboard surfaces the new contract

**DO:** Land on `/dashboard` as Alex. Under "Suggested for you," Sam's new "Clip our demo day highlight reel" contract should be sitting there, with the subtitle "Matched to your skills: clipping, captions" (or similar).

**SAY:** "Alex didn't search for this — it found her. Her profile lists clipping and captions as skills, and that's exactly what this contract needs."

**ARCHITECTURE:** This isn't an ML recommendation service — it's a plain scoring function in the dashboard's server component: split the user's comma-separated `skills` string, check which tokens appear in each open task's title/description/category, sort by match count. A few lines of TypeScript, zero external dependencies. It's the kind of thing that's tempting to over-build for a demo, and deliberately wasn't.

---

## Scene 9 — Into the contract

**DO:** Click the contract **title** (not the Accept button on the card — we want the full page). Walk the detail page: category badge, "Handler" block linking to Sam's profile, the brief, the deliverables list.

**SAY:** "Full brief, exactly what Sam typed, plus a link straight to her Handler profile — Alex can vet who she's working with before she commits to anything."

---

## Scene 10 — Accept the contract

**DO:** Click **Accept contract** in the action panel. Toast: *"Contract accepted. File your debrief before the deadline."* The panel flips to a debrief-filing form.

**ARCHITECTURE:** `claimTask` re-checks, against a fresh database read, that the task is still active, isn't Alex's own post, that she has no existing submission on it, and that a slot is actually open — all server-side, all at the moment of the click. A stale or manipulated client can't slip past these; the guards live in the action, not the UI.

---

## Scene 11 — File the debrief

**DO:** Paste a proof link (e.g. `https://drive.google.com/demo-clip`) and a short note. Submit. Toast: *"Debrief filed. Payment extracts on approval."* Panel now shows an info callout: **"Debrief in review."**

**ARCHITECTURE:** `submitProof` is a single action that handles two paths — upgrading an existing `claimed` row to `submitted`, or inserting straight to `submitted` if someone skips the claim step entirely (the UI always claims first, but the action doesn't assume that). Proof is just two text columns — a URL and a note — no file upload service; that's an explicit v1 cut, not an oversight.

---

## Scene 12 — Alex's Vault, pending

**DO:** Click **Your Vault** in the navbar → `/earnings`. Point at the **"Pending clearance"** stat card — it now includes this $60.

**SAY:** "Nothing's paid yet — this is a promise, not cash. Her actual balance hasn't moved."

**ARCHITECTURE:** That distinction is structural: `balance_cents` on the `users` table only changes on approval. "Pending clearance" is computed on the fly by summing payouts on this user's `submitted`-status rows — it's a display number, not a reserved/escrowed balance anywhere in the schema.

---

## Scene 13 — Back to Sam: review and approve

**DO:** Sign out, log back in as `sam@dossier.app`. Go to **Console**. Alex's new debrief is in the queue — since it's ordered oldest-first, scroll to the **bottom** to find it (the freshest one). Click the proof link to show it's a real reviewable link, then click **"Approve & release $60."** Toast: *"Debrief approved — $60 released to Alex Rivera."* The card disappears from the queue.

**ARCHITECTURE:** This is the one place real money moves, and it's a single Postgres transaction (`sql.begin`) doing four things atomically: flip the submission to `approved`, insert an `earning` row into `transactions`, credit Alex's `balance_cents`, and — if that was the contract's last open slot — flip the task itself to `completed`. All four succeed together or none do; there's no path where a payout gets recorded but the balance doesn't move.

---

## Scene 14 — Back to Alex: get paid, extract

**DO:** Sign out, log back in as Alex. Go to **Your Vault**. Balance and "Lifetime extracted" have both jumped by $60, and a new ledger row shows the contract title with a `+$60.00`. Click **Extract funds**. Toast: *"Extraction initiated — funds arrive in 1–2 business days (simulated)."* Balance drops to $0; a new ledger row reads "Extraction to bank ···· 4242."

**SAY:** "That's the full loop — issue, accept, deliver, approve, extract — closed on both sides, live."

**ARCHITECTURE:** Withdrawal is deliberately the most honestly-fake part of the app: it zeroes the balance and logs a `withdrawal` transaction, full stop — there's no bank rail, no Stripe Connect, nothing wired to real money movement. The toast says "(simulated)" on purpose. Everything upstream of this line — the debrief, the approval, the ledger, the balance math — is real; this last step is the one place we drew an honest line for a 2-hour build.

---

## Optional flourishes (if there's time)

- **`/search`** — search "video" or "clipping" as Alex and show it return both matching contracts *and* matching operatives in one query pair — a small "find work, find people" moment.
- **`/operatives/[id]`** — click Alex's own name in the navbar to show her public operative dossier: approval rating, contracts closed, lifetime extracted, recent record. This is the reputation layer that makes a Handler trust a stranger enough to approve their work.
- **`/how`** ("Protocol") — the in-app one-pager explaining the loop for both roles, money rules, and "everyone wins" pitch (Handlers, Operatives, and Whop itself). Good to point to as "this exists for a new visitor who lands here cold," but skip walking through it live — it's redundant with what you just demoed.

---

## Closing line

"Two real accounts, one real Postgres database, one atomic transaction where the money actually moves — and every pixel is Whop's own component library. That's Dossier."
