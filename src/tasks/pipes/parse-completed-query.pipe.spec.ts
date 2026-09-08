// [NES-6 · lesson 05] Reference — custom query pipe behavior tests.
import { BadRequestException } from '@nestjs/common';
import { ParseCompletedQueryPipe } from './parse-completed-query.pipe';

describe('ParseCompletedQueryPipe', () => {
  const pipe = new ParseCompletedQueryPipe();

  it.each([
    ['true', 'true'],
    ['1', 'true'],
    ['false', 'false'],
    ['0', 'false'],
  ])('canonicalizes %s to %s', (input, expected) => {
    expect(pipe.transform(input)).toBe(expected);
  });

  it('keeps an omitted query value undefined', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('throws BadRequestException for an unsupported value', () => {
    expect(() => pipe.transform('maybe')).toThrow(BadRequestException);
  });
});
