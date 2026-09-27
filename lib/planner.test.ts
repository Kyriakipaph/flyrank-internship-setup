import { describe, it, expect } from 'vitest';
import {
  planRequestSchema,
  taskPlanSchema,
  planResponseSchema,
  fallbackPlan,
  inferCakeType,
  buildPlanPrompt,
} from './planner';

describe('planRequestSchema', () => {
  it('accepts a valid goal', () => {
    expect(planRequestSchema.safeParse({ goal: 'Finish the report' }).success).toBe(true);
  });

  it('rejects an empty goal', () => {
    expect(planRequestSchema.safeParse({ goal: '' }).success).toBe(false);
  });

  it('rejects a goal that is too short', () => {
    expect(planRequestSchema.safeParse({ goal: 'hi' }).success).toBe(false);
  });

  it('rejects a goal over 500 chars', () => {
    const long = 'x'.repeat(501);
    expect(planRequestSchema.safeParse({ goal: long }).success).toBe(false);
  });
});

describe('inferCakeType', () => {
  it('returns cupcake for short sessions (<15 min)', () => {
    expect(inferCakeType(5)).toBe('cupcake');
    expect(inferCakeType(14)).toBe('cupcake');
  });

  it('returns cake for medium sessions (15-45 min)', () => {
    expect(inferCakeType(15)).toBe('cake');
    expect(inferCakeType(30)).toBe('cake');
    expect(inferCakeType(45)).toBe('cake');
  });

  it('returns tiered for long sessions (>45 min)', () => {
    expect(inferCakeType(46)).toBe('tiered');
    expect(inferCakeType(90)).toBe('tiered');
    expect(inferCakeType(180)).toBe('tiered');
  });
});

describe('taskPlanSchema (structured AI output validation)', () => {
  const validPlan = {
    refinedName: 'Read chapter 3 and answer review questions',
    targetMinutes: 30,
    category: 'study',
    cakeType: 'cake',
    vibe: 'zen',
    subtasks: ['Read the chapter', 'Answer review questions'],
    rationale: '30 minutes is a solid focused study block.',
  };

  it('accepts a well-formed plan', () => {
    expect(taskPlanSchema.safeParse(validPlan).success).toBe(true);
  });

  it('rejects unknown category', () => {
    expect(taskPlanSchema.safeParse({ ...validPlan, category: 'weekend' }).success).toBe(false);
  });

  it('rejects unknown vibe', () => {
    expect(taskPlanSchema.safeParse({ ...validPlan, vibe: 'neon' }).success).toBe(false);
  });

  it('rejects unknown cakeType', () => {
    expect(taskPlanSchema.safeParse({ ...validPlan, cakeType: 'pie' }).success).toBe(false);
  });

  it('rejects targetMinutes above the cap', () => {
    expect(taskPlanSchema.safeParse({ ...validPlan, targetMinutes: 500 }).success).toBe(false);
  });

  it('rejects an empty subtasks array', () => {
    expect(taskPlanSchema.safeParse({ ...validPlan, subtasks: [] }).success).toBe(false);
  });

  it('rejects more than 6 subtasks', () => {
    expect(
      taskPlanSchema.safeParse({
        ...validPlan,
        subtasks: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      }).success,
    ).toBe(false);
  });

  it('rejects an oversized refinedName', () => {
    const longName = 'x'.repeat(200);
    expect(taskPlanSchema.safeParse({ ...validPlan, refinedName: longName }).success).toBe(false);
  });
});

describe('planResponseSchema', () => {
  it('accepts a plan tagged with source: groq', () => {
    const res = planResponseSchema.safeParse({
      plan: {
        refinedName: 'Task',
        targetMinutes: 30,
        category: 'work',
        cakeType: 'cake',
        vibe: 'elegant',
        subtasks: ['step one'],
        rationale: 'because it makes sense',
      },
      source: 'groq',
    });
    expect(res.success).toBe(true);
  });

  it('rejects an unknown source', () => {
    const res = planResponseSchema.safeParse({
      plan: {
        refinedName: 'Task',
        targetMinutes: 30,
        category: 'work',
        cakeType: 'cake',
        vibe: 'elegant',
        subtasks: ['step one'],
        rationale: 'x',
      },
      source: 'openai',
    });
    expect(res.success).toBe(false);
  });
});

describe('fallbackPlan (keyword-based classifier)', () => {
  it('classifies study goals as study/zen', () => {
    const p = fallbackPlan('Read chapter 5 and revise for the exam');
    expect(p.category).toBe('study');
    expect(p.vibe).toBe('zen');
  });

  it('classifies work goals as work/elegant', () => {
    const p = fallbackPlan('Send the client report and prep the slide deck');
    expect(p.category).toBe('work');
    expect(p.vibe).toBe('elegant');
  });

  it('classifies health goals as health', () => {
    const p = fallbackPlan('Go for a run and stretch');
    expect(p.category).toBe('health');
  });

  it('classifies creative goals as creative/rainbow', () => {
    const p = fallbackPlan('Draw a sketch and paint it');
    expect(p.category).toBe('creative');
    expect(p.vibe).toBe('rainbow');
  });

  it('classifies personal goals as personal', () => {
    const p = fallbackPlan('Call mom and do the laundry');
    expect(p.category).toBe('personal');
  });

  it('falls back to other/classic for unknown goals', () => {
    const p = fallbackPlan('xyzzy foo bar');
    expect(p.category).toBe('other');
    expect(p.vibe).toBe('classic');
  });

  it('picks a short target when the goal says quick', () => {
    const p = fallbackPlan('A quick email reply');
    expect(p.targetMinutes).toBe(10);
    expect(p.cakeType).toBe('cupcake');
  });

  it('picks a long target when the goal says deep', () => {
    const p = fallbackPlan('Deep focus on writing the whole essay');
    expect(p.targetMinutes).toBe(90);
    expect(p.cakeType).toBe('tiered');
  });

  it('truncates long goals when using them as refinedName', () => {
    const longGoal = 'x'.repeat(200);
    const p = fallbackPlan(longGoal);
    expect(p.refinedName.length).toBeLessThanOrEqual(80);
    expect(p.refinedName.endsWith('…')).toBe(true);
  });

  it('always returns at least one subtask', () => {
    const p = fallbackPlan('do something');
    expect(p.subtasks.length).toBeGreaterThan(0);
  });

  it('returns a plan that validates against taskPlanSchema', () => {
    const p = fallbackPlan('Prep slides for the client presentation');
    expect(taskPlanSchema.safeParse(p).success).toBe(true);
  });
});

describe('buildPlanPrompt', () => {
  it('includes the user goal verbatim', () => {
    const prompt = buildPlanPrompt('Read chapter 3');
    expect(prompt).toContain('Read chapter 3');
  });

  it('asks for JSON output only', () => {
    const prompt = buildPlanPrompt('anything');
    expect(prompt.toLowerCase()).toContain('json');
    expect(prompt.toLowerCase()).toContain('no markdown');
  });

  it('lists every allowed category id in the prompt', () => {
    const prompt = buildPlanPrompt('anything');
    for (const c of ['work', 'study', 'personal', 'health', 'creative', 'other']) {
      expect(prompt).toContain(c);
    }
  });
});
