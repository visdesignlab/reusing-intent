export function isEmptyOrNull<T>(obj: T | null): obj is null {
  if (!obj) return true;

  return JSON.stringify(obj) === JSON.stringify({});
}
