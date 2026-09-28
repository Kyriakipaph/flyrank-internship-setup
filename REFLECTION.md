# Reflection

This was my first time building my own app from scratch, and I honestly
didn't expect to enjoy it as much as I did. I had the idea for TierUp
sitting in my head for a while. I wanted to create a focus timer that grows
a cake as you work to help me stay motivated. And being able to actually build it, 
adjust it, and see it change in front of me was really fun. The best part was how new ideas kept
appearing as I made progress: the calendar page, the different cake vibes,
the handwritten little notes in the corners, the mobile bottom nav. None
of those were in my original plan. They came from actually using the app
myself and thinking "this needs one more thing."

## The hardest part

Working out how to use AI in a way that actually mattered. My first
attempt was the Session Coach, which shows a short reflection after each
focus session. It worked, and technically it was AI, but when I looked at
it honestly I realised I could have written that same feature with a
templated message and a few variables. It wasn't really solving anything
the app needed.

So I built the Task Planner. That one actually solves a real problem:
when I created a task before, I had to 'guess' a target time, pick a
category, choose a cake type, and decide on a vibe. It was five decisions
every time. The AI takes a plain sentence like "prep slides for the
client presentation" and fills all of that in for me, plus breaks it
into subtasks. Getting to that point — the point where the AI feature is actually useful, 
not just present — was the hardest thinking of the whole capstone because of the nature of my idea.

## What I would do differently next time

- **Start with the AI feature.** I spent weeks polishing the visual side
  before I had any AI code running, which is backwards for a capstone
  where AI integration is the main thing being graded.
- **Add tests as I go, not all at the end.** I wrote all 57 tests in one
  sitting after the app was already built. Writing them alongside each
  feature would have caught a bug earlier where 5-minute tasks were
  showing as 50-minute tasks because I reused a field name.
- **Set up Vercel properly before the first push.** My first two deploys
  failed because I forgot to add environment variables and didn't know
  Vercel needed a `.npmrc` file for the peer dependency conflict. Ten
  minutes of prep would have saved half an hour of red build emails.

## One thing that surprised me

How much AI can do, and how quickly. I knew AI was powerful in general,
but seeing it in my own app really put things in perspective.
Typing a rough sentence and getting back a structured plan with a sensible target time, category, vibe, and
subtasks, all in a second or two was genuinely amazing. The prompt
itself is only a dozen lines. Most of the work is the plumbing around it
(validating the response, handling failures, streaming the coach output).
That plumbing is where I learned the most this term.
