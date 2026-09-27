import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionCoach from './SessionCoach';
import type { CoachRequest } from '@/lib/coach';

const baseRequest: CoachRequest = {
  taskName: 'Read chapter 3',
  category: 'study',
  targetMinutes: 25,
  elapsedMinutes: 25,
  completed: true,
};

/**
 * Build a Response object whose body is an SSE stream of the given events,
 * mimicking what the /api/coach route sends.
 */
function sseResponse(events: unknown[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const ev of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

describe('<SessionCoach />', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Reset to a known state before each test.
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('is a modal dialog with an accessible heading', () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      sseResponse([{ type: 'done' }]),
    );
    render(<SessionCoach request={baseRequest} onDismiss={() => {}} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('renders streamed reflection and tip text', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      sseResponse([
        { type: 'reflection', text: 'Great job on Read chapter 3.' },
        { type: 'tip', text: 'Summarize the chapter in one line.' },
        { type: 'done' },
      ]),
    );

    render(<SessionCoach request={baseRequest} onDismiss={() => {}} />);

    expect(
      await screen.findByText('Great job on Read chapter 3.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Summarize the chapter in one line.'),
    ).toBeInTheDocument();

    // Status line shows the AI source once done.
    expect(await screen.findByText(/Coached by AI · via Groq/i)).toBeInTheDocument();
  });

  it('shows the offline status line when the server flags an error', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      sseResponse([
        { type: 'reflection', text: 'fallback line 1' },
        { type: 'tip', text: 'fallback line 2' },
        { type: 'error', message: 'upstream failure' },
      ]),
    );

    render(<SessionCoach request={baseRequest} onDismiss={() => {}} />);

    // Both fallback lines land on screen.
    expect(await screen.findByText('fallback line 1')).toBeInTheDocument();
    expect(await screen.findByText('fallback line 2')).toBeInTheDocument();
    // And the status flips to the offline label instead of the AI label.
    expect(
      await screen.findByText(/Offline tip \(coach unavailable\)/i),
    ).toBeInTheDocument();
  });

  it('falls back locally when the fetch itself fails (network down)', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('network down'));

    render(<SessionCoach request={baseRequest} onDismiss={() => {}} />);

    // The client-side fallback (fallbackCoachEvents) uses the taskName in the
    // reflection copy, and offline label in the status.
    await waitFor(() => {
      expect(
        screen.getByText(/Offline tip \(coach unavailable\)/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText((t) => t.includes('Read chapter 3')),
    ).toBeInTheDocument();
  });

  it('calls onDismiss when the Continue button is clicked', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      sseResponse([{ type: 'done' }]),
    );
    const onDismiss = vi.fn();

    render(<SessionCoach request={baseRequest} onDismiss={onDismiss} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Continue/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
