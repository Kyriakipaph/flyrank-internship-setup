# TierUp

**A focus timer that bakes cakes.** Pick a task, choose a cake shape and vibe,
and grow an SVG cake as you work. Finished sessions live in the kitchen, so
you can look back on what you focused on over time.

- **Live:** https://tierup-focus.vercel.app
- **Repo:** https://github.com/Kyriakipaph/flyrank-internship-setup
- **Stack:** Next.js 16 · TypeScript · Tailwind CSS · Firebase Firestore · Groq API

---

## Setup

```bash
git clone https://github.com/Kyriakipaph/flyrank-internship-setup.git
cd flyrank-internship-setup
npm install --legacy-peer-deps
cp .env.example .env      # fill in your Firebase + Groq keys
npm run dev
```

Open http://localhost:3000. You need Node 20+ and:

- 6 Firebase config values (from Firebase console → Project settings → General)
- 1 Groq API key (free tier at https://console.groq.com/keys)

See `.env.example` for the exact variable names.

---

## Architecture

```
app/
├── page.tsx              landing page
├── tasks/                task list + AI planner entry
├── focus/                active focus session (timer + cake)
├── kitchen/              gallery of completed cakes
├── calendar/             month grid + day detail
└── api/
    ├── coach/            AI: streaming session coach
    └── plan-task/        AI: structured JSON planner

components/tierup/        cake, timer, pickers, dialogs, nav
contexts/FocusContext.tsx global session state, autosaves every 15s
lib/
├── firebase.ts           Firestore init
├── tasks.ts              task CRUD
├── coach.ts              coach schemas + fallback
├── planner.ts            planner schemas + fallback
├── categories.ts, vibes.ts
```

---

## AI integration

Two Groq-powered features, both live behind API routes so the key stays
server-only. Both use `openai/gpt-oss-20b` on Groq's free tier.

**Task Planner** (`POST /api/plan-task`) — the user types a natural-language
goal, the AI returns a structured JSON object with a refined task name,
target minutes, category, cake type, vibe, subtasks, and rationale. Zod
validates the response before it reaches the UI.

Example: *"Prep slides for the client presentation"* →

```json
{
  "refinedName": "Prepare Q4 growth strategy deck",
  "targetMinutes": 60,
  "category": "work",
  "cakeType": "tiered",
  "vibe": "elegant",
  "subtasks": ["Outline key metrics", "Draft narrative", "Design visuals"],
  "rationale": "60 minutes matches a serious deck creation session."
}
```

This solves a real friction: users had to make 5 decisions every time they
added a task. The AI does them all from one sentence.

**Session Coach** (`POST /api/coach`) — after a focus session finishes, the
API streams a two-line reflection (SSE) tailored to the task, category, and
whether the user completed or gave up.

**Prompts** live in `lib/planner.ts::buildPlanPrompt` and
`lib/coach.ts::buildPrompt`.

**Resilience** — three fallback layers: if `GROQ_API_KEY` is unset, if the
Groq API errors, or if the response is malformed, the routes fall back to a
deterministic hand-written response and the UI shows an "Offline" label.
The app never crashes on AI failure.

---

## Known limitations & future improvements

- **No auth.** Firestore rules are open; anyone visiting the app sees the
  same shared task list. Fine for a personal demo, not for real users.
- **No task editing.** Tasks can be created and deleted but not renamed.
- **Session state is client-only.** If the tab closes mid-session, up to
  15 s of unsaved focus time can be lost.
- **Same model for both AI features.** The planner would benefit from a
  stronger model on longer/ambiguous goals.
- **No PWA install manifest.** Responsive but not installable to a home
  screen.
