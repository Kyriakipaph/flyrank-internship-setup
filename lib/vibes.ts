export type VibeId =
  | 'classic'
  | 'elegant'
  | 'chocolate'
  | 'romantic'
  | 'rainbow'
  | 'zen';

export type TierColor = {
  body: string;
  icing: string;
  darker: string;
};

export type TopperKind =
  | 'cherry'
  | 'rose'
  | 'heart'
  | 'star'
  | 'flower'
  | 'chocolate-curl';

export type VibeStyle = {
  topper: TopperKind;
  /** Sprinkle density across the cake. */
  sprinkles: 'none' | 'few' | 'lots';
  /** If true, tier tops have piped rosette dollops; false = smooth icing. */
  dollops: boolean;
  /** Optional extra decoration painted along tier edges. */
  extra?: 'pearls' | 'drips' | 'petals';
};

export type Vibe = {
  id: VibeId;
  label: string;
  description: string;
  swatch: [string, string, string];
  tiers: TierColor[];
  style: VibeStyle;
};

export const VIBES: Vibe[] = [
  {
    id: 'classic',
    label: '🎉 Party',
    description: 'Bright, sprinkles, cherry on top',
    swatch: ['#fbcfe8', '#fde68a', '#bae6fd'],
    tiers: [
      { body: '#fbcfe8', icing: '#ec4899', darker: '#f9a8d4' },
      { body: '#fed7aa', icing: '#f97316', darker: '#fdba74' },
      { body: '#fde68a', icing: '#eab308', darker: '#fcd34d' },
      { body: '#bbf7d0', icing: '#22c55e', darker: '#86efac' },
      { body: '#bae6fd', icing: '#0ea5e9', darker: '#7dd3fc' },
      { body: '#ddd6fe', icing: '#8b5cf6', darker: '#c4b5fd' },
    ],
    style: { topper: 'cherry', sprinkles: 'lots', dollops: true },
  },
  {
    id: 'elegant',
    label: '💍 Elegant',
    description: 'Smooth ivory, pearls, a single rose',
    swatch: ['#fefce8', '#fef3c7', '#eab308'],
    tiers: [
      { body: '#fefce8', icing: '#fef9c3', darker: '#fef3c7' },
      { body: '#fef9c3', icing: '#facc15', darker: '#fef3c7' },
      { body: '#fef3c7', icing: '#eab308', darker: '#fde68a' },
      { body: '#fef9c3', icing: '#facc15', darker: '#fef3c7' },
      { body: '#fefce8', icing: '#eab308', darker: '#fef3c7' },
      { body: '#fef9c3', icing: '#ca8a04', darker: '#fef3c7' },
    ],
    style: {
      topper: 'rose',
      sprinkles: 'none',
      dollops: false,
      extra: 'pearls',
    },
  },
  {
    id: 'chocolate',
    label: '🍫 Chocolate',
    description: 'Drippy cocoa, rich and indulgent',
    swatch: ['#78350f', '#a16207', '#292524'],
    tiers: [
      { body: '#fef3c7', icing: '#78350f', darker: '#fde68a' },
      { body: '#a16207', icing: '#451a03', darker: '#78350f' },
      { body: '#78350f', icing: '#292524', darker: '#57190a' },
      { body: '#a16207', icing: '#451a03', darker: '#78350f' },
      { body: '#78350f', icing: '#292524', darker: '#57190a' },
      { body: '#57190a', icing: '#1c1917', darker: '#292524' },
    ],
    style: {
      topper: 'chocolate-curl',
      sprinkles: 'none',
      dollops: false,
      extra: 'drips',
    },
  },
  {
    id: 'romantic',
    label: '❤️ Romantic',
    description: 'Blush pinks, hearts, and petals',
    swatch: ['#fce7f3', '#f472b6', '#be123c'],
    tiers: [
      { body: '#fce7f3', icing: '#f472b6', darker: '#fbcfe8' },
      { body: '#fbcfe8', icing: '#ec4899', darker: '#f9a8d4' },
      { body: '#f9a8d4', icing: '#db2777', darker: '#f472b6' },
      { body: '#fecdd3', icing: '#e11d48', darker: '#fda4af' },
      { body: '#fda4af', icing: '#be123c', darker: '#fb7185' },
      { body: '#fb7185', icing: '#9f1239', darker: '#f43f5e' },
    ],
    style: {
      topper: 'heart',
      sprinkles: 'few',
      dollops: true,
      extra: 'petals',
    },
  },
  {
    id: 'rainbow',
    label: '🌈 Playful',
    description: 'Every color, sprinkles galore, star on top',
    swatch: ['#eab308', '#dc2626', '#7c3aed'],
    tiers: [
      { body: '#fef08a', icing: '#eab308', darker: '#facc15' },
      { body: '#fdba74', icing: '#ea580c', darker: '#f97316' },
      { body: '#fca5a5', icing: '#dc2626', darker: '#f87171' },
      { body: '#a5f3fc', icing: '#0891b2', darker: '#67e8f9' },
      { body: '#c4b5fd', icing: '#7c3aed', darker: '#a78bfa' },
      { body: '#f472b6', icing: '#be185d', darker: '#ec4899' },
    ],
    style: { topper: 'star', sprinkles: 'lots', dollops: true },
  },
  {
    id: 'zen',
    label: '🍵 Zen',
    description: 'Matcha green, minimal, one flower',
    swatch: ['#dcfce7', '#86efac', '#15803d'],
    tiers: [
      { body: '#dcfce7', icing: '#86efac', darker: '#bbf7d0' },
      { body: '#bbf7d0', icing: '#4ade80', darker: '#86efac' },
      { body: '#86efac', icing: '#22c55e', darker: '#4ade80' },
      { body: '#4ade80', icing: '#16a34a', darker: '#22c55e' },
      { body: '#22c55e', icing: '#15803d', darker: '#16a34a' },
      { body: '#166534', icing: '#14532d', darker: '#15803d' },
    ],
    style: { topper: 'flower', sprinkles: 'none', dollops: false },
  },
];

export function getVibe(id: VibeId | undefined): Vibe {
  return VIBES.find((v) => v.id === id) ?? VIBES[0];
}
