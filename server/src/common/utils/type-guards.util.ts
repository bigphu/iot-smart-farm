export function isErrorCode(
  error: unknown,
): error is { code: number | string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}
