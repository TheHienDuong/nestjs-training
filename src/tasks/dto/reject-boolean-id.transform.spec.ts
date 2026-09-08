import { rejectBooleanId } from './reject-boolean-id.transform';

// [NES-121 · lesson 08 corrective] Unit coverage for the boolean-id guard —
// see reject-boolean-id.transform.ts for why @Type(() => Number) alone lets
// true/false through as 1/0.
describe('rejectBooleanId', () => {
  it('leaves `true` as a boolean, so @IsInt() rejects it', () => {
    expect(rejectBooleanId({ value: true })).toBe(true);
  });

  it('leaves `false` as a boolean, so @IsInt() rejects it', () => {
    expect(rejectBooleanId({ value: false })).toBe(false);
  });

  it('still coerces a numeric string to a number', () => {
    expect(rejectBooleanId({ value: '5' })).toBe(5);
  });

  it('still coerces a number to a number', () => {
    expect(rejectBooleanId({ value: 5 })).toBe(5);
  });

  it('leaves an array unchanged, so @IsInt() rejects it', () => {
    expect(rejectBooleanId({ value: ['5'] })).toEqual(['5']);
  });

  it('leaves an empty array unchanged, so @IsInt() rejects it', () => {
    expect(rejectBooleanId({ value: [] })).toEqual([]);
  });
});
