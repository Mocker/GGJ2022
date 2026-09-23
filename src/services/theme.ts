export interface ThemeConfig {
  name: string;
  suffix: string;
  displayName: string;
  colorHex: string;
}

export const DIGIVICE_THEMES: Record<string, ThemeConfig> = {
  'Mountain Steel': {
    name: 'Mountain Steel',
    suffix: 'Mountain Steel',
    displayName: 'Steel Grey',
    colorHex: '#8492a6',
  },
  'Dragon Blood': {
    name: 'Dragon Blood',
    suffix: 'DB',
    displayName: 'Crimson Red',
    colorHex: '#e11d48',
  },
  'Golden Beam': {
    name: 'Golden Beam',
    suffix: 'gold',
    displayName: 'Solar Gold',
    colorHex: '#f59e0b',
  },
  'Sage Bog': {
    name: 'Sage Bog',
    suffix: 'Sage Bog',
    displayName: 'Forest Sage',
    colorHex: '#10b981',
  },
  'Cool Bronze': {
    name: 'Cool Bronze',
    suffix: 'Cool Bronze',
    displayName: 'Bronze Metal',
    colorHex: '#d97706',
  },
};

export const THEME_NAMES = Object.keys(DIGIVICE_THEMES);
