import { z } from 'zod';

const CATEGORY_IDS = ['work', 'study', 'personal', 'health', 'creative', 'other'] as const;
const VIBE_IDS = ['classic', 'elegant', 'chocolate', 'romantic', 'rainbow', 'zen'] as const;
const CAKE_TYPES = ['cupcake', 'cake', 'tiered'] as const;

export const planRequestSchema = z.object({
  goal: z.string().min(3).max(500),
});
export type PlanRequest = z.infer<typeof planRequestSchema>;

export const taskPlanSchema = z.object({
  refinedName: z.string().min(1).max(80),
  targetMinutes: z.number().int().min(5).max(180),
  category: z.enum(CATEGORY_IDS),
  cakeType: z.enum(CAKE_TYPES),
  vibe: z.enum(VIBE_IDS),
  subtasks: z.array(z.string().min(1).max(120)).min(1).max(6),
  rationale: z.string().min(1).max(300),
});
export type TaskPlan = z.infer<typeof taskPlanSchema>;

export const planResponseSchema = z.object({
  plan: taskPlanSchema,
  source: z.enum(['groq', 'fallback-no-key', 'fallback-error']),
});
export type PlanResponse = z.infer<typeof planResponseSchema>;

/**
 * Choose a cake type based on target duration:
 * <15min → cupcake, 15-45min → cake, >45min → tiered.
 */
export function inferCakeType(minutes: number): (typeof CAKE_TYPES)[number] {
  if (minutes < 15) return 'cupcake';
  if (minutes <= 45) return 'cake';
  return 'tiered';
}

/**
 * Keyword-based fallback plan used when the AI API is unavailable, misconfigured,
 * or returns malformed output. Deterministic and keeps the UX intact.
 */
export function fallbackPlan(goal: string): TaskPlan {
  const g = goal.toLowerCase();
  let category: (typeof CATEGORY_IDS)[number] = 'other';
  if (/(study|read|homework|assignment|exam|revise|learn|essay|chapter)/.test(g)) category = 'study';
  else if (/(work|report|email|deck|slide|meeting|deadline|client)/.test(g)) category = 'work';
  else if (/(gym|run|workout|meditate|walk|sleep|stretch|yoga)/.test(g)) category = 'health';
  else if (/(draw|paint|write|design|music|photo|sketch|craft)/.test(g)) category = 'creative';
  else if (/(call|clean|laundry|shop|errand|appoint|birthday)/.test(g)) category = 'personal';

  const targetMinutes = /(quick|short|small|5 ?min|10 ?min)/.test(g)
    ? 10
    : /(long|deep|marathon|whole|full)/.test(g)
      ? 90
      : 30;

  const vibe: (typeof VIBE_IDS)[number] =
    category === 'study' ? 'zen'
    : category === 'work' ? 'elegant'
    : category === 'health' ? 'zen'
    : category === 'creative' ? 'rainbow'
    : category === 'personal' ? 'classic'
    : 'classic';

  const refinedName = goal.length > 80 ? goal.slice(0, 77) + '…' : goal;

  return {
    refinedName,
    targetMinutes,
    category,
    cakeType: inferCakeType(targetMinutes),
    vibe,
    subtasks: [
      'Set up your workspace and remove distractions',
      'Start the timer and dive in',
      'Wrap up with a 1-minute review',
    ],
    rationale: `Set as a ${targetMinutes}-minute ${category} session based on keywords in your goal. Adjust anything that doesn't feel right.`,
  };
}

export function buildPlanPrompt(goal: string): string {
  return `You are a focus-time planner for TierUp, an app where each finished focus session grows a small cake.

The user typed this goal:
"""${goal}"""

Reply with ONE JSON object and nothing else. No markdown, no code fences, no explanation. The shape must be exactly:

{
  "refinedName": "<a clear, short task name derived from the goal, under 80 characters, sentence case>",
  "targetMinutes": <integer between 5 and 180, realistic for the task>,
  "category": "<one of: work, study, personal, health, creative, other>",
  "cakeType": "<one of: cupcake (for <15 min), cake (15-45 min), tiered (>45 min)>",
  "vibe": "<one of: classic, elegant, chocolate, romantic, rainbow, zen>",
  "subtasks": [<2 to 5 concrete steps as short strings, in order, each under 120 chars>],
  "rationale": "<one sentence explaining WHY this target time and structure fit the goal, under 200 characters>"
}

Choose category based on the actual work, not just keywords. Choose vibe to match the mood: elegant for professional, zen for study or reflection, rainbow for creative, romantic for personal, chocolate for indulgent, classic for fun. Match cakeType to targetMinutes exactly. Subtasks should be actionable, not abstract.`;
}
