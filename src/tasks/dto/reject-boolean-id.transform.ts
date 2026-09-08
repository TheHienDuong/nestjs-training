// [NES-121 · lesson 08 corrective, NES-122 hardening] Shared `class-transformer`
// transform for `projectId`/`assigneeId`. `@Type(() => Number)` coerces
// `true`/`false` to `1`/`0` *before* `@IsInt()`/`@IsPositive()` run, so
// `{ projectId: true }` silently passed validation as `1`. Booleans are left
// untouched here so `@IsInt()` correctly rejects them. Arrays get the same
// treatment: `Number(['5'])` coerces a single-element array to the scalar `5`,
// so `{ projectId: ['5'] }` would otherwise also slip past validation as a
// valid id — arrays are left untouched so `@IsInt()` rejects them too. Every
// other value still coerces to a number, preserving the existing
// string/number-id behavior.
export function rejectBooleanId({ value }: { value: unknown }): unknown {
  return typeof value === 'boolean' || Array.isArray(value)
    ? value
    : Number(value);
}
