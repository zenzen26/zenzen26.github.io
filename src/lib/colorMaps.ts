/** Maps a CSV color value to a bg- class (card headers, experience badges, etc.) */
export const bgColorMap: Record<string, string> = {
  green: 'bg-moss text-white',
  amber: 'bg-phosphor text-ink',
  red: 'bg-grey text-ink',
  black: 'bg-ink text-white',
};

/** Maps a project type to its pill classes */
export const typeColorMap: Record<string, string> = {
  AI: 'bg-phosphor text-ink',
  Web: 'bg-moss text-white',
  Data: 'bg-grey text-ink',
};
