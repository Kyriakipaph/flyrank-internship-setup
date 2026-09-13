export type CategoryId =
  | 'work'
  | 'study'
  | 'personal'
  | 'health'
  | 'creative'
  | 'other';

export type Category = {
  id: CategoryId;
  label: string;
  color: string; // used for chip/text
  soft: string; // used for chip background
  border: string;
};

export const CATEGORIES: Category[] = [
  { id: 'work', label: 'Work', color: '#1d4ed8', soft: '#dbeafe', border: '#93c5fd' },
  { id: 'study', label: 'Study', color: '#6d28d9', soft: '#ede9fe', border: '#c4b5fd' },
  { id: 'personal', label: 'Personal', color: '#047857', soft: '#d1fae5', border: '#86efac' },
  { id: 'health', label: 'Health', color: '#b91c1c', soft: '#fee2e2', border: '#fca5a5' },
  { id: 'creative', label: 'Creative', color: '#be185d', soft: '#fce7f3', border: '#f9a8d4' },
  { id: 'other', label: 'Other', color: '#57534e', soft: '#e7e5e4', border: '#d6d3d1' },
];

export function getCategory(id: CategoryId | undefined): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[5];
}
