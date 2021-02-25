export function isNullOrUndefined<T>(val: T | null | undefined): val is null | undefined {
  return val === null || val === undefined;
}

export function isNotNullOrUndefined<T>(val: T | null | undefined): val is T {
  return !isNullOrUndefined(val);
}
