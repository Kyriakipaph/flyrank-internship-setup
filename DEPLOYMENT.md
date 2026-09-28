# Deployment

The app is live at **https://tierup-focus.vercel.app**. It's hosted on
Vercel, and every time I push new code to the `main` branch, Vercel
automatically builds and updates the live site.

## What I check before I push

Before I push any new code, I run through this list so I don't accidentally
break the live site. The ticks show what I did for the current version.

- ✓ My tests all pass (`npm test`)
- ✓ The app builds on my laptop without errors (`npm run build`)
- ✓ All 7 secret keys are set on Vercel (6 for the database, 1 for the AI)
- ✓ The `.npmrc` file is in the project so Vercel can install everything
   without complaining
- ✓ I opened the live site after the deploy and tested the two AI features
   to make sure they work

The keys and the `.npmrc` file were the two things that broke my first
deploys, so I keep them on the list to remind myself not to forget them.

## What happens when things break

I wrote the AI features so that if anything goes wrong, the app doesn't
crash. The user just gets a slightly less personalised experience.

- If my **AI key isn't set** → the coach and planner still work, they just
  show hand-written messages I wrote in advance. A small label in the UI
  says "Offline (AI unconfigured)".
- If the **AI service is down** → same thing, they fall back to the
  hand-written messages and the label says "Offline (AI unavailable)".
- If the **AI sends back a weird response** → the planner uses a simple
  keyword-based backup version instead. The user never sees an error.
- If the **database fails** → the tasks page shows a small red error
  message instead of getting stuck loading forever.

The main point is: **even if the AI is completely broken, the app still
works.**

## How I roll back if a deploy breaks

Two ways.

**Fast (30 seconds):**
1. Go to Vercel → Deployments
2. Find the last working version (green tick)
3. Click the "..." menu → Promote to Production
4. The live site is back on the old version in about 10 seconds.

**Slower (using git):**

```bash
git checkout main
git log --oneline -5           # find the last good commit
git reset --hard <good-sha>
git push --force-with-lease origin main
```

Vercel picks up the push and rebuilds the old version.

One thing rollback doesn't undo: any tasks that got saved to the database
while the broken version was live. Those stay in the database. That's
fine for TierUp because nothing in the app deletes data.

## Monitoring

I'm not doing any fancy monitoring right now. Vercel sends me an email if a
deploy fails, and I can see the build status in the dashboard. That's
enough for a personal project. If this app had real users, I'd add
something like Sentry to track errors and a health check that pings the
database.
