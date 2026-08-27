// [NES-121 · lesson 08 corrective] Shared `class-transformer` transform for
// `projectId`/`assigneeId`. `@Type(() => Number)` coerces `true`/`false` to
// `1`/`0` *before* `@IsInt()`/`@IsPositive()` run, so `{ projectId: true }`
// silently passed validation as `1`. Booleans are left untouched here so
// `@IsInt()` correctly rejects them; every other value still coerces to a
// number, preserving the existing string/number-id behavior.
export function rejectBooleanId({ value }: { value: unknown }): unknown {
  return typeof value === 'boolean' ? value : Number(value);
}
