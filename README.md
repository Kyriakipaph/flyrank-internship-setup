# TierUp

**A focus timer that bakes cakes.** Pick a task, choose a cake shape and vibe,
and grow an SVG cake as you work. Finished sessions live in the kitchen, so
you can look back on what you focused on over time.

- **Live:** https://tierup-focus.vercel.app
- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Firebase Firestore · Groq API · Vitest
- **AI:** two integrations powered by Groq (`openai/gpt-oss-20b`) — a task planner that turns natural-language goals into structured tasks, and a session coach that reflects on finished sessions.

Built for the FlyRank AI Frontend Engineering internship capstone.

---

## Quick start

**Requirements:** Node.js 20+, a Firebase project, and a Groq API key.

```bash
git clone https://github.com/Kyriakipaph/flyrank-internship-setup.git
cd flyrank-internship-setup
npm install --legacy-peer-deps
cp .env.example .env   # then fill in your keys (see next section)
npm run dev
```

Open http://localhost:3000. The app should load, the tasks page should hit
Firestore, and the AI features should reach Groq — if anything is missing, the
UI falls back gracefully (see [Resilience](#resilience) below).

### Environment variables

TierUp reads seven variables from `.env` at the project root:

| Key | Purpose | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client init | Firebase console → Project settings → General |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firestore project | same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage | same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase config | same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app id | same |
| `GROQ_API_KEY` | AI planner + coach | https://console.groq.com/keys (free tier, no card required) |

The `NEXT_PUBLIC_*` prefix is Next.js's convention for values that get baked
into the client bundle. `GROQ_API_KEY` has no prefix — it stays server-only
and is only ever read inside API route handlers.

---

## Architecture

```
app/
├── page.tsx                  ← marketing landing
├── tasks/page.tsx            ← task list + task planner entry point
├── focus/page.tsx            ← active focus session (timer + cake)
├── kitchen/page.tsx          ← gallery of completed cakes
├── calendar/page.tsx         ← month grid with tasks by day
├── calendar/[date]/page.tsx  ← day detail
└── api/
    ├── coach/route.ts        ← AI: streaming session coach (SSE)
    └── plan-task/route.ts    ← AI: structured JSON task planner

components/tierup/
├── Cake.tsx, MiniCake.tsx, Cupcake.tsx, SingleCake.tsx
├── vibeElements.tsx          ← per-vibe SVG bits (toppers, sprinkles, drips)
├── CircularTimer.tsx, CircularSlider.tsx
├── SessionCoach.tsx          ← AI coach modal
├── TaskPlanner.tsx           ← AI planner modal
├── VibePicker.tsx, CakeTypePicker.tsx, CategoryPicker.tsx
├── BottomNav.tsx, FocusMiniIndicator.tsx
└── FocusSession.tsx          ← focus-page glue (timer + cake + coach hook-in)

contexts/
└── FocusContext.tsx          ← global session state (survives navigation, autosaves every 15s)

lib/
├── firebase.ts               ← Firebase app + Firestore init
├── tasks.ts                  ← Task CRUD + Firestore mapping + legacy migration
├── categories.ts             ← 6 category presets
├── vibes.ts                  ← 6 cake vibes (styles, tier colors, toppers)
├── coach.ts                  ← Zod schemas + prompt + deterministic fallback for coach
└── planner.ts                ← Zod schemas + prompt + deterministic fallback for planner
```

### Data model (Firestore)

Single collection `tasks`. Each doc:

```ts
{
  name: string,
  totalSecondsFocused: number,
  targetMinutesV2: number,       // legacy `targetMinutes` field migrated on read
  vibe: 'classic' | 'elegant' | 'chocolate' | 'romantic' | 'rainbow' | 'zen',
  cakeType: 'cupcake' | 'cake' | 'tiered',
  category: 'work' | 'study' | 'personal' | 'health' | 'creative' | 'other',
  status: 'unfinished' | 'completed',
  createdAt: Timestamp,
  completedAt?: Timestamp,
  dueDate?: Timestamp,
}
```

### Session state

`FocusContext` keeps the current session in memory so timer + cake survive
navigation. It writes back to Firestore every 15 seconds (autosave) and on
every meaningful transition (break start, session complete, save & exit).
Timer only ticks when running and not on break.

---

## AI integration

TierUp uses two Groq-powered features. Both live behind API routes
(`app/api/*`) so no client code ever sees the API key. Both use
`openai/gpt-oss-20b` with `reasoning_effort: 'low'` — the smallest reasoning
model on Groq's free tier that consistently returns well-formed output.

### 1. Task Planner (`POST /api/plan-task`)

**Problem it solves:** users guess badly at target times, avoid the category
picker, and stare at vague goals like *"finish assignment"* without a plan.
Adding a task in TierUp requires filling five fields (name, target minutes,
category, vibe, cake type) — annoying friction on the main flow. The AI
removes it.

**Flow:**

1. User types a natural-language goal in the "Plan with AI" modal.
2. Client POSTs `{ goal: string }` to `/api/plan-task` (Zod-validated).
3. Server calls Groq with `response_format: { type: 'json_object' }` and a
   prompt (see `lib/planner.ts::buildPlanPrompt`) that enumerates the exact
   category / vibe / cakeType enums the app accepts.
4. Server parses the JSON, then validates it against `taskPlanSchema` (Zod).
5. Client receives `{ plan, source: 'groq' | 'fallback-no-key' | 'fallback-error' }`.
6. User sees a card with the refined task name, target minutes, category chip,
   vibe chip, subtasks list, and rationale. One click creates the task in
   Firestore.

**Example:**

> **User:** *"Prep slides for the client presentation on Friday"*
>
> **AI:**
> ```json
> {
>   "refinedName": "Prepare Q4 growth strategy deck",
>   "targetMinutes": 60,
>   "category": "work",
>   "cakeType": "tiered",
>   "vibe": "elegant",
>   "subtasks": [
>     "Outline key Q4 metrics and growth drivers",
>     "Draft slide narrative",
>     "Design slide visuals",
>     "Rehearse the flow"
>   ],
>   "rationale": "60 minutes matches a serious deck creation session."
> }
> ```

### 2. Session Coach (`POST /api/coach`)

**Problem it solves:** a finished focus session normally ends in nothing —
kitchen just gains a cake. The coach turns that moment into a short reflection
tailored to what you actually did (category, target vs. actual minutes,
whether you completed or gave up), and one concrete tip.

**Flow:**

1. On session finish or give-up, the app opens `SessionCoach` with a snapshot
   of the just-finished task.
2. Client POSTs the snapshot to `/api/coach` (Zod-validated).
3. Server calls Groq **with streaming enabled** and asks for exactly two
   lines: reflection + tip.
4. As each newline arrives, the server emits an SSE event
   (`{ type: 'reflection', text }` then `{ type: 'tip', text }`, then
   `{ type: 'done' }`).
5. Client reads the SSE stream, parses each event through `coachEventSchema`
   (Zod discriminated union), and renders the reflection + tip as they arrive.

### Resilience

Both AI features degrade gracefully at three layers:

1. **Missing API key** (`GROQ_API_KEY` not set) — the route returns a
   deterministic hand-written response tagged `source: fallback-no-key`. UI
   shows an "Offline (AI unconfigured)" status line.
2. **Upstream API error** (Groq rate limit / network / model unavailable) —
   route catches the exception, returns the same deterministic fallback tagged
   `source: fallback-error`. UI shows an "Offline (AI unavailable)" line.
3. **Malformed AI output** (invalid JSON, fails Zod validation) — planner
   route falls back to the keyword-based classifier; coach route emits the
   deterministic fallback plus an `{ type: 'error' }` event.

The client-side `SessionCoach` and `TaskPlanner` components also fall back
locally if `fetch` itself throws (offline browser, DNS failure, aborted).

### Prompts

The exact prompts live in:
- `lib/coach.ts::buildPrompt` — two-line response, category-aware
- `lib/planner.ts::buildPlanPrompt` — JSON-only, enum-constrained, subtask cap

---

## Testing

```bash
npm test                # run once
npm run test:watch      # watch mode
npm run test:coverage   # with coverage report
```

**57 tests across 4 files:**

| File | Tests | Coverage |
|---|---|---|
| `lib/coach.test.ts` | 15 | schema validation, discriminated union, fallback branches |
| `lib/planner.test.ts` | 27 | schema validation, cake-type inference, keyword classifier, prompt shape |
| `components/tierup/SessionCoach.test.tsx` | 5 | mocked SSE stream, error path, dismiss, ARIA |
| `components/tierup/TaskPlanner.test.tsx` | 6 | form validation, plan render, offline banner, HTTP 500, create flow |

Coverage focuses on the AI-critical files:

- `lib/coach.ts` — 95% statements, 100% functions
- `lib/planner.ts` — 96% statements, 100% functions
- `components/tierup/SessionCoach.tsx` — 91% statements
- `components/tierup/TaskPlanner.tsx` — 83% statements

Presentational SVG components (Cake, MiniCake, Cupcake, vibeElements) are not
unit-tested — they're pure output with no branching logic, so tests would
just re-assert markup.

---

## Deployment

Deployed on Vercel with automatic deploys from `main`.

**One-time setup:**

1. Import the repo in Vercel.
2. Copy each of the 7 env vars into Vercel → Settings → Environment Variables.
   Firebase vars = `Config` type; `GROQ_API_KEY` = `Secret` type. All three
   environments (Production, Preview, Development).
3. Push to `main` — Vercel builds and deploys automatically.

`.npmrc` at the repo root enables `legacy-peer-deps=true` because a couple of
Testing Library packages haven't updated their React 19 peer ranges yet.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the deployment checklist, rollback
plan, and error-handling matrix.

---

## Known limitations & future improvements

- **No auth.** Firestore rules are open to anyone with the project ID. Fine
  for a personal capstone demo, not fine for anything with real users. Adding
  Firebase Auth would gate reads/writes per user.
- **No task editing.** Tasks can be created and deleted but not renamed or
  retargeted after creation. Would need an edit modal + Firestore `update`.
- **Session state is client-only.** If you close the tab mid-session, the
  in-memory elapsed time is lost between the last autosave (max 15 s) and
  the close. Server-tracked sessions would fix this.
- **Coach and planner share one model.** `openai/gpt-oss-20b` is fine for both
  but the planner would benefit from a stronger model on longer / more
  ambiguous goals.
- **Firestore composite indexes.** The calendar page filters unfinished
  tasks with a due date; on a larger dataset that query would want an index.
- **No PWA install manifest.** The app is responsive down to phone widths but
  can't be installed to a home screen yet.
- **Accessibility gaps.** Dialogs trap click-outside but focus trap is
  minimal — a small custom trap or a headless library would tighten it up.
- **Reflection copy diversity.** The fallback coach lines are static; on a
  streak of API failures a user would see the same fallback repeatedly.

---

## Scripts

```bash
npm run dev              # start dev server
npm run build            # production build (type-checked)
npm run start            # run the production build
npm run lint             # eslint
npm test                 # vitest, run once
npm run test:watch       # vitest, watch mode
npm run test:coverage    # vitest with v8 coverage
```

---

## License

Personal capstone project.
