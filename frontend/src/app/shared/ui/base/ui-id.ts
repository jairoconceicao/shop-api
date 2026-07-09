let nextId = 0;

export function createUiId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}
