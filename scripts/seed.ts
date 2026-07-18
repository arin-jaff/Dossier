import { faker } from "@faker-js/faker";
import { sql } from "../src/lib/db";

const DAY = 86_400_000;
const now = Date.now();
faker.seed(7);

const uid = (p: string) => `${p}_${faker.string.alphanumeric(10)}`;

type U = { id: string; name: string; bio: string; skills: string; balanceCents: number };
type T = {
  id: string; posterId: string; title: string; description: string; category: string;
  requirements: string; payoutCents: number; slotsTotal: number; deadlineAt: number;
  status: string; createdAt: number;
};
type S = {
  id: string; taskId: string; earnerId: string; status: string; proofText: string | null;
  proofUrl: string | null; rejectReason: string | null; claimedAt: number;
  submittedAt: number | null; reviewedAt: number | null;
};

async function main() {
  await sql`DELETE FROM transactions`;
  await sql`DELETE FROM submissions`;
  await sql`DELETE FROM tasks`;
  await sql`DELETE FROM users`;

  const alex: U = { id: "usr_alex", name: "Alex Rivera", bio: "Clipper & video editor. 200+ contracts closed.", skills: "video editing, clipping, ugc, captions", balanceCents: 0 };
  const sam: U = { id: "usr_sam", name: "Sam Chen", bio: "Runs Chen Trading Academy — 4,000 members on Whop.", skills: "copywriting, course design, trading content", balanceCents: 0 };
  const jordan: U = { id: "usr_jordan", name: "Jordan Patel", bio: "Building FitStack, a fitness community on Whop.", skills: "community, fitness content, product", balanceCents: 0 };
  const EXTRA_SKILLS = [
    "clipping, captions, short-form video",
    "translation, spanish, localization",
    "copywriting, hooks, ad creative",
    "ghostwriting, twitter threads, video editing",
    "ux research, screen recording, qa",
    "qa, bug hunting, mobile testing",
  ];
  const extras: U[] = Array.from({ length: 6 }, (_, i) => ({
    id: uid("usr"), name: faker.person.fullName(), bio: "Operative on Dossier.", skills: EXTRA_SKILLS[i], balanceCents: 0,
  }));
  const users = [alex, sam, jordan, ...extras];

  const t = (
    poster: U, title: string, category: string, payout: number, slots: number,
    deadlineDays: number, ageDays: number, description: string, requirements: string,
    status = "active",
  ): T => ({
    id: uid("tsk"), posterId: poster.id, title, description, category, requirements,
    payoutCents: payout * 100, slotsTotal: slots, deadlineAt: now + deadlineDays * DAY,
    status, createdAt: now - ageDays * DAY,
  });

  const tasks: T[] = [
    t(sam, "Clip my podcast into viral TikToks", "content", 15, 10, 7, 2,
      "I drop a 90-minute trading podcast every Monday. Cut it into punchy 30–60s vertical clips with captions. Best clip each week gets a bonus slot on the next batch.",
      "- 9:16 vertical, 1080p or better\n- Burned-in captions\n- Hook in the first 2 seconds\n- Submit a TikTok or Drive link"),
    t(sam, "Design a banner for my Discord server", "design", 50, 1, 5, 1,
      "Chen Trading Academy is rebranding. I need a clean Discord banner that matches my storefront — dark, sharp, no stock-chart clichés.",
      "- 960x540 PNG\n- Use my logo (in the brief doc)\n- 2 concepts minimum"),
    t(sam, "Write 10 ad hooks for my trading course", "writing", 25, 3, 4, 3,
      "Scaling my course ads and my hooks are stale. Write 10 scroll-stopping openers aimed at people who already trade but want structure.",
      "- 10 hooks, under 12 words each\n- No 'get rich' claims\n- Paste them as text"),
    t(jordan, "Film a UGC review of my fitness app", "video", 75, 5, 10, 2,
      "FitStack just launched workout streaks. Film a natural 30–60s selfie-style review showing the app on your phone. Real reactions beat polish.",
      "- Show the streaks screen on camera\n- 30–60 seconds\n- Natural lighting, clear audio"),
    t(jordan, "Bug-hunt my checkout flow", "dev", 20, 8, 6, 1,
      "Run through FitStack's checkout on mobile and desktop and try to break it. Every reproducible bug with steps gets paid.",
      "- Steps to reproduce\n- Device + browser\n- Screenshot or recording link"),
    t(jordan, "Translate my landing page to Spanish", "writing", 60, 1, 8, 6,
      "Translate the FitStack landing page (about 800 words) into natural, native-sounding Spanish. No machine-translation pass-offs.",
      "- Native fluency\n- Keep the tone punchy\n- Deliver as a doc link", "completed"),
    t(sam, "Turn my newsletter into 5 X threads", "social", 30, 4, 5, 2,
      "Take my last four newsletter issues and turn each week's best idea into a thread that stands alone. You get a ghost credit and repeat work if they hit.",
      "- 5 threads, 6–10 posts each\n- First post must hook without context\n- Submit as a doc or thread links"),
    t(jordan, "Design 3 YouTube thumbnails", "design", 45, 2, 6, 4,
      "Three videos shipping next week: a 30-day challenge recap, an app update, and a founder Q&A. I need thumbnails that pop at 120px.",
      "- 1280x720\n- Max 3 words of text each\n- Follow the 3-color rule in the brief"),
    t(sam, "Research 20 podcasts for guest spots", "social", 40, 2, 9, 1,
      "Find 20 active podcasts in trading/investing that take guests, with host names and booking contacts. Quality over size — engaged shows beat big ones.",
      "- Spreadsheet link\n- Contact email or booking form per show\n- No dead shows (episode in last 30 days)"),
    t(jordan, "Edit my 10-minute YouTube video", "video", 120, 1, 5, 1,
      "Raw footage of my '30 days of FitStack' video is shot. Cut it to 10 minutes, tighten pacing, add captions and light zooms. Raw files in the brief.",
      "- 10 min final cut\n- Captions + music\n- Deliver via Drive"),
    t(sam, "Rebuild my webinar deck as a LinkedIn carousel", "design", 35, 3, 7, 2,
      "My 40-slide webinar converts, but nobody sees it. Compress it into a 10-slide LinkedIn carousel that teaches one sharp idea.",
      "- 10 slides, 1080x1350\n- One idea per slide\n- PDF + source file"),
    t(jordan, "Moderate my Discord for launch week", "social", 100, 2, 12, 3,
      "FitStack v2 launches Monday. I need two mods covering US evenings to answer questions, route bugs, and keep energy up.",
      "- 2 hrs/day for 5 days\n- Log of questions handled\n- Prior mod experience a plus"),
    t(sam, "Review my app onboarding (screen recording)", "dev", 10, 15, 14, 1,
      "Install my mobile app, record your first five minutes, and narrate what confuses you. Cold eyes only — don't read the docs first.",
      "- 5+ min screen recording with voice\n- First-time use only\n- Loom or Drive link"),
    t(jordan, "Record a 60-second promo voiceover", "video", 55, 1, 6, 2,
      "Warm, energetic voiceover for FitStack's launch promo. Script is 140 words. Deliver clean audio, no music bed.",
      "- WAV or high-bitrate MP3\n- No background noise\n- 2 takes minimum"),
    t(sam, "SEO audit of my Whop storefront", "dev", 80, 1, 10, 5,
      "Audit my storefront and content pages: what's blocking discovery, what to fix first, and why. Actionable beats exhaustive.",
      "- Top 10 fixes ranked by impact\n- Before/after examples\n- Doc link"),
    t(jordan, "Make a 10-meme pack for my community", "content", 20, 6, 8, 1,
      "Gym-culture memes tuned to FitStack inside jokes (streak-breaking, rest-day guilt, PR day). Funny beats polished.",
      "- 10 memes\n- PNG, readable on mobile\n- Drive folder link"),
    t(sam, "Beta-test my AI prompt pack", "dev", 12, 10, 9, 2,
      "I'm shipping a 50-prompt pack for traders. Run 10 prompts, rate the outputs, and flag any that fall flat.",
      "- Score each prompt 1–5\n- One-line note per prompt\n- Paste results as text"),
    t(jordan, "5 Instagram story templates", "design", 40, 2, 7, 3,
      "Reusable story templates my members fill in with their workout stats. On-brand, bold, thumb-stopping.",
      "- 1080x1920, editable\n- FitStack colors (brief attached)\n- Canva or Figma link"),
    t(sam, "Produce the launch trailer for my flagship course", "video", 500, 2, 12, 0,
      "Chen Trading Academy's biggest release of the year needs a 90-second cinematic trailer. Raw testimonial footage, screen captures, and brand kit provided. This is the contract everyone sees first — bring your best cut.",
      "- 90 seconds, 16:9 + 9:16 exports\n- Licensed or original music only\n- Two revision rounds included\n- Deliver via Drive with project files"),
  ];

  const s = (task: T, earner: U, status: string, over: Partial<S> = {}): S => ({
    id: uid("sub"), taskId: task.id, earnerId: earner.id, status,
    proofText: null, proofUrl: null, rejectReason: null,
    claimedAt: now - 2 * DAY, submittedAt: null, reviewedAt: null, ...over,
  });

  const subs: S[] = [
    s(tasks[0], extras[0], "submitted", { proofUrl: "https://www.tiktok.com/@marcusclips/video/7382910", proofText: "Cut the 'liquidity trap' segment — strongest hook of the ep.", claimedAt: now - 1 * DAY, submittedAt: now - 0.5 * DAY }),
    s(tasks[0], extras[1], "submitted", { proofUrl: "https://www.tiktok.com/@editsbylena/video/7382544", proofText: "Went with the FOMC reaction clip, captions styled like your last viral one.", claimedAt: now - 1.2 * DAY, submittedAt: now - 0.8 * DAY }),
    s(tasks[0], alex, "submitted", { proofUrl: "https://www.tiktok.com/@alexrivera/video/7383001", proofText: "Clipped the risk-management rant. Hook lands at 0:02.", claimedAt: now - 0.9 * DAY, submittedAt: now - 0.2 * DAY }),
    s(tasks[2], extras[2], "submitted", { proofText: "1. Your stop loss is lying to you\n2. I traded for 6 years before learning this\n3. The chart pattern nobody screenshots\n4. Why your wins feel random\n5. Backtesting is not a personality\n6. Your journal is your edge\n7. Risk 1% or explain yourself\n8. The market doesn't know you're due\n9. Structure beats signals\n10. Trade less. Earn more.", claimedAt: now - 2 * DAY, submittedAt: now - 1 * DAY }),
    s(tasks[6], extras[3], "submitted", { proofUrl: "https://docs.google.com/document/d/1kQ8threads", proofText: "5 threads drafted, thread 3 (position sizing) is the sleeper hit.", claimedAt: now - 1.5 * DAY, submittedAt: now - 0.6 * DAY }),
    s(tasks[12], extras[4], "submitted", { proofUrl: "https://www.loom.com/share/9f2c1onboarding", proofText: "Got lost at the broker-connect step — narrated the whole thing.", claimedAt: now - 1 * DAY, submittedAt: now - 0.4 * DAY }),
    s(tasks[4], extras[5], "submitted", { proofText: "Bug: applying promo code after switching to annual billing charges monthly price. Steps: 1) add monthly to cart 2) switch to annual 3) apply LAUNCH20 4) total shows monthly discount. iPhone 15 Safari + Chrome desktop. Recording: https://www.loom.com/share/checkout-bug", claimedAt: now - 1.1 * DAY, submittedAt: now - 0.3 * DAY }),
    s(tasks[15], extras[0], "submitted", { proofUrl: "https://drive.google.com/drive/folders/memes-fitstack", proofText: "10 memes, the rest-day-guilt one is going to hurt feelings.", claimedAt: now - 1.4 * DAY, submittedAt: now - 0.7 * DAY }),
    s(tasks[2], alex, "approved", { proofText: "10 hooks delivered — mixed pain-point and curiosity angles.", claimedAt: now - 4 * DAY, submittedAt: now - 3.5 * DAY, reviewedAt: now - 3 * DAY }),
    s(tasks[12], alex, "approved", { proofUrl: "https://www.loom.com/share/alex-onboarding-review", claimedAt: now - 6 * DAY, submittedAt: now - 5.5 * DAY, reviewedAt: now - 5 * DAY }),
    s(tasks[15], alex, "approved", { proofUrl: "https://drive.google.com/drive/folders/alex-meme-pack", claimedAt: now - 8 * DAY, submittedAt: now - 7.5 * DAY, reviewedAt: now - 7 * DAY }),
    s(tasks[5], extras[1], "approved", { proofUrl: "https://docs.google.com/document/d/es-translation", claimedAt: now - 6 * DAY, submittedAt: now - 5 * DAY, reviewedAt: now - 4.5 * DAY }),
    s(tasks[12], extras[2], "approved", { proofUrl: "https://www.loom.com/share/first-five-minutes", claimedAt: now - 4 * DAY, submittedAt: now - 3.5 * DAY, reviewedAt: now - 3 * DAY }),
    s(tasks[7], alex, "rejected", { proofUrl: "https://drive.google.com/drive/folders/alex-thumbs", rejectReason: "Thumbnails didn't follow the 3-color rule in the brief — happy to review a revision.", claimedAt: now - 5 * DAY, submittedAt: now - 4.5 * DAY, reviewedAt: now - 4 * DAY }),
    s(tasks[3], alex, "claimed", { claimedAt: now - 1 * DAY }),
    s(tasks[9], extras[3], "claimed", { claimedAt: now - 0.5 * DAY }),
  ];

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const txns = subs
    .filter((sub) => sub.status === "approved")
    .map((sub) => ({
      id: uid("txn"), userId: sub.earnerId, amountCents: taskById.get(sub.taskId)!.payoutCents,
      kind: "earning", submissionId: sub.id, createdAt: sub.reviewedAt!,
    }));
  txns.push({ id: uid("txn"), userId: alex.id, amountCents: 2000, kind: "withdrawal", submissionId: null as unknown as string, createdAt: now - 2 * DAY });

  for (const txn of txns) {
    const user = users.find((u) => u.id === txn.userId)!;
    user.balanceCents += txn.kind === "earning" ? txn.amountCents : -txn.amountCents;
  }

  for (const u of users) await sql`INSERT INTO users ${sql(u)}`;
  for (const task of tasks) await sql`INSERT INTO tasks ${sql(task)}`;
  for (const sub of subs) await sql`INSERT INTO submissions ${sql(sub)}`;
  for (const txn of txns) await sql`INSERT INTO transactions ${sql(txn)}`;

  console.log(`seeded: ${users.length} users, ${tasks.length} tasks, ${subs.length} submissions, ${txns.length} txns`);
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
