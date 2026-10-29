import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { ChildPages } from '.';

// Without `globals: true`, Testing Library can't register its own cleanup.
afterEach(cleanup);

const page = (id: string, title: string, icon: string | null = null) => ({
  id, title, icon, updatedAt: new Date(),
});

test('renders nothing for a page without children', () => {
  const { container } = render(<ChildPages pages={[]} />);
  expect(container.innerHTML).toBe('');
});

test('links to each child, in the order given', () => {
  render(<ChildPages pages={[page('1', 'First'), page('2', 'Second')]} />);

  const list = screen.getByRole('list', { name: 'Pages in this folder' });
  const links = within(list).getAllByRole('link');
  expect(links.map((a) => a.getAttribute('href'))).toEqual(['/pages/1', '/pages/2']);
  expect(links[0].textContent).toContain('First');
  expect(links[1].textContent).toContain('Second');
});

test('falls back to "Untitled" for a page with no title', () => {
  render(<ChildPages pages={[page('1', '')]} />);
  expect(screen.getByRole('link').textContent).toContain('Untitled');
});

test("shows the page's emoji when it has one", () => {
  render(<ChildPages pages={[page('1', 'Ideas', '💡')]} />);
  expect(screen.getByRole('link').textContent).toContain('💡');
});
