import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskPlanner from './TaskPlanner';
import type { PlanResponse } from '@/lib/planner';

// Stub out the Firestore-backed createTask so tests don't touch Firebase.
vi.mock('@/lib/tasks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/tasks')>();
  return {
    ...actual,
    createTask: vi.fn().mockResolvedValue('mock-id'),
  };
});

const validPlan: PlanResponse = {
  plan: {
    refinedName: 'Prepare Q4 growth strategy deck',
    targetMinutes: 60,
    category: 'work',
    cakeType: 'tiered',
    vibe: 'elegant',
    subtasks: [
      'Outline key Q4 metrics',
      'Draft slide narrative',
      'Design slide visuals',
    ],
    rationale: '60 minutes matches a serious deck creation session.',
  },
  source: 'groq',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('<TaskPlanner />', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders as an accessible modal dialog with the goal prompt', () => {
    render(<TaskPlanner onClose={() => {}} onCreated={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(
      screen.getByRole('heading', { name: /What are you trying to get done/i }),
    ).toBeInTheDocument();
  });

  it('disables Plan button until the goal is at least 3 characters', async () => {
    const user = userEvent.setup();
    render(<TaskPlanner onClose={() => {}} onCreated={() => {}} />);

    const button = screen.getByRole('button', { name: /Plan it for me/i });
    expect(button).toBeDisabled();

    const textbox = screen.getByRole('textbox');
    await user.type(textbox, 'hi');
    expect(button).toBeDisabled();

    await user.type(textbox, ' friend');
    expect(button).toBeEnabled();
  });

  it('submits the goal and renders the returned plan', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(validPlan));

    const user = userEvent.setup();
    render(<TaskPlanner onClose={() => {}} onCreated={() => {}} />);

    await user.type(
      screen.getByRole('textbox'),
      'Prep slides for the Q4 client presentation',
    );
    await user.click(screen.getByRole('button', { name: /Plan it for me/i }));

    // Refined name from the plan appears.
    expect(
      await screen.findByText('Prepare Q4 growth strategy deck'),
    ).toBeInTheDocument();

    // All three subtasks appear.
    expect(screen.getByText('Outline key Q4 metrics')).toBeInTheDocument();
    expect(screen.getByText('Draft slide narrative')).toBeInTheDocument();
    expect(screen.getByText('Design slide visuals')).toBeInTheDocument();

    // Status line reports the AI source.
    expect(screen.getByText(/Planned by AI · via Groq/i)).toBeInTheDocument();

    // Rationale is shown.
    expect(
      screen.getByText(/60 minutes matches a serious deck creation session/i),
    ).toBeInTheDocument();
  });

  it('shows the offline banner when the server returns a fallback source', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({
        ...validPlan,
        source: 'fallback-error',
      }),
    );

    const user = userEvent.setup();
    render(<TaskPlanner onClose={() => {}} onCreated={() => {}} />);

    await user.type(screen.getByRole('textbox'), 'do something meaningful');
    await user.click(screen.getByRole('button', { name: /Plan it for me/i }));

    // Warning banner about the fallback appears.
    expect(
      await screen.findByText(/keyword-based fallback/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Offline plan \(AI unavailable\)/i),
    ).toBeInTheDocument();
  });

  it('shows an error state when the API returns HTTP 500', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ error: 'boom' }, 500),
    );

    const user = userEvent.setup();
    render(<TaskPlanner onClose={() => {}} onCreated={() => {}} />);

    await user.type(screen.getByRole('textbox'), 'plan something for me');
    await user.click(screen.getByRole('button', { name: /Plan it for me/i }));

    // The form stays visible (no plan card) and the inline status shows the error.
    await waitFor(() => {
      expect(screen.getByText(/Planner failed \(500\)/i)).toBeInTheDocument();
    });
    // The Plan button becomes available again.
    expect(screen.getByRole('button', { name: /Plan it for me/i })).toBeEnabled();
  });

  it('calls onCreated and onClose after Create task succeeds', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(validPlan));

    const user = userEvent.setup();
    const onClose = vi.fn();
    const onCreated = vi.fn();

    render(<TaskPlanner onClose={onClose} onCreated={onCreated} />);

    await user.type(screen.getByRole('textbox'), 'Prep slides for Q4 client deck');
    await user.click(screen.getByRole('button', { name: /Plan it for me/i }));

    // Wait for the plan card to appear.
    await screen.findByText('Prepare Q4 growth strategy deck');

    await user.click(screen.getByRole('button', { name: /Create task/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
