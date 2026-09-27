import { z } from 'zod';

export const coachRequestSchema = z.object({
  taskName: z.string().min(1).max(200),
  category: z.string().min(1).max(40),
  targetMinutes: z.number().int().positive().max(600),
  elapsedMinutes: z.number().int().nonnegative().max(600),
  completed: z.boolean(),
});

export type CoachRequest = z.infer<typeof coachRequestSchema>;

export const coachEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('reflection'), text: z.string() }),
  z.object({ type: z.literal('tip'), text: z.string() }),
  z.object({ type: z.literal('done') }),
  z.object({ type: z.literal('error'), message: z.string() }),
]);

export type CoachEvent = z.infer<typeof coachEventSchema>;

// Deterministic fallback used when the AI API is unavailable, misconfigured,
// or returns malformed output. Keeps the UX intact.
export function fallbackCoachEvents(req: CoachRequest): CoachEvent[] {
  const hitTarget = req.completed && req.elapsedMinutes >= req.targetMinutes;
  const reflection = hitTarget
    ? `You finished "${req.taskName}" — that's a full ${req.elapsedMinutes}-minute session in the oven.`
    : req.completed
      ? `Nice work wrapping up "${req.taskName}" — ${req.elapsedMinutes} minutes on the clock.`
      : `You stepped away from "${req.taskName}" after ${req.elapsedMinutes} minutes — every minute counts.`;
  const tip = hitTarget
    ? 'Take a moment before the next task — even 60 seconds of stillness makes the next session sharper.'
    : 'Next time, try shrinking the target by 5 minutes — smaller wins compound faster than long grinds.';
  return [
    { type: 'reflection', text: reflection },
    { type: 'tip', text: tip },
    { type: 'done' },
  ];
}
