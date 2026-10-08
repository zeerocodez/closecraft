export const zIndex = { guide: 1000 };
export const LOOP_FOOTPRINT_PX = 400;
export const ABOVE_BANNER_AND_PAGE_FAB = 1001;
let offset = { x: 0, y: 0 };
export function setFloatingOffset(x: number, y: number) { offset = { x, y }; }
export function getFloatingOffset() { return offset; }
