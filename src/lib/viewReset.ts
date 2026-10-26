/** Hero "Reset view": draggable windows return home and the 3D Mac turns back to the front. */
export const RESET_VIEW_EVENT = 'zen:reset-view';
export const resetView = () => window.dispatchEvent(new Event(RESET_VIEW_EVENT));
