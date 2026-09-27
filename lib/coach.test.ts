import { describe, it, expect } from 'vitest';
import {
  coachRequestSchema,
  coachEventSchema,
  fallbackCoachEvents,
  type CoachRequest,
} from './coach';

describe('coachRequestSchema', () => {
  const valid: CoachRequest = {
    taskName: 'Read chapter 3',
    category: 'study',
    targetMinutes: 25,
    elapsedMinutes: 20,
    completed: true,
  };

  it('accepts a well-formed request', () => {
    expect(coachRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty task name', () => {
    const bad = { ...valid, taskName: '' };
    expect(coachRequestSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a negative elapsed time', () => {
    const bad = { ...valid, elapsedMinutes: -1 };
    expect(coachRequestSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects targetMinutes over the cap', () => {
    const bad = { ...valid, targetMinutes: 999 };
    expect(coachRequestSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a non-boolean completed flag', () => {
    const bad = { ...valid, completed: 'yes' as unknown as boolean };
    expect(coachRequestSchema.safeParse(bad).success).toBe(false);
  });
});

describe('coachEventSchema (streaming discriminated union)', () => {
  it('parses a reflection event', () => {
    const ev = coachEventSchema.parse({ type: 'reflection', text: 'Nice work.' });
    expect(ev.type).toBe('reflection');
  });

  it('parses a tip event', () => {
    const ev = coachEventSchema.parse({ type: 'tip', text: 'Take a break.' });
    expect(ev.type).toBe('tip');
  });

  it('parses a done event', () => {
    const ev = coachEventSchema.parse({ type: 'done' });
    expect(ev.type).toBe('done');
  });

  it('parses an error event with a message', () => {
    const ev = coachEventSchema.parse({ type: 'error', message: 'boom' });
    expect(ev).toEqual({ type: 'error', message: 'boom' });
  });

  it('rejects an unknown event type', () => {
    expect(coachEventSchema.safeParse({ type: 'praise', text: '!' }).success).toBe(false);
  });
});

describe('fallbackCoachEvents (deterministic fallback)', () => {
  const base: CoachRequest = {
    taskName: 'Write essay',
    category: 'study',
    targetMinutes: 30,
    elapsedMinutes: 30,
    completed: true,
  };

  it('returns exactly reflection + tip + done', () => {
    const events = fallbackCoachEvents(base);
    expect(events).toHaveLength(3);
    expect(events[0].type).toBe('reflection');
    expect(events[1].type).toBe('tip');
    expect(events[2].type).toBe('done');
  });

  it('celebrates full completion', () => {
    const events = fallbackCoachEvents(base);
    const reflection = events[0];
    if (reflection.type !== 'reflection') throw new Error('expected reflection');
    expect(reflection.text).toContain('full');
    expect(reflection.text).toContain('Write essay');
  });

  it('acknowledges early completion (done under target)', () => {
    const events = fallbackCoachEvents({
      ...base,
      elapsedMinutes: 10,
      completed: true,
    });
    const reflection = events[0];
    if (reflection.type !== 'reflection') throw new Error('expected reflection');
    // Not a "full session" — different copy path
    expect(reflection.text).toContain('Nice work');
  });

  it('acknowledges early exit (not completed)', () => {
    const events = fallbackCoachEvents({
      ...base,
      elapsedMinutes: 5,
      completed: false,
    });
    const reflection = events[0];
    if (reflection.type !== 'reflection') throw new Error('expected reflection');
    expect(reflection.text).toContain('stepped away');
  });

  it('never returns empty strings for reflection or tip', () => {
    const events = fallbackCoachEvents(base);
    for (const ev of events) {
      if (ev.type === 'reflection' || ev.type === 'tip') {
        expect(ev.text.length).toBeGreaterThan(0);
      }
    }
  });
});
