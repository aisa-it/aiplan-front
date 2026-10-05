export function pickDefinedKeys<T extends object>(source: T, config: object) {
  const keys = Object.keys(config) as (keyof T)[];

  return Object.fromEntries(
    keys.map((key) => [key, source[key]]),
  ) as Partial<T>;
}

export function getStringParam(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
