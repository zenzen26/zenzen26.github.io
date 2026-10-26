import { useEffect } from 'react';

/**
 * Shows `cursor` on <body> while `active` (e.g. hovering something clickable inside the 3D canvas, where
 * normal CSS :hover cannot reach). Clears the inline style afterwards so the stylesheet's glove cursors apply.
 */
export function useCursor(active: boolean, cursor = 'pointer') {
  useEffect(() => {
    if (!active) return;
    document.body.style.cursor = cursor;
    return () => {
      document.body.style.cursor = '';
    };
  }, [active, cursor]);
}
