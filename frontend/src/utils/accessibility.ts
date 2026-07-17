export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

export function ariaLabelIfHidden(label: string, visible: boolean): string | undefined {
  return visible ? undefined : label;
}

export const FOCUS_RING = 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
