// [NES-6 · lesson 05] Reference — custom query pipe for completed filters.
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseCompletedQueryPipe implements PipeTransform<
  string | undefined,
  string | undefined
> {
  transform(value: string | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === 'true' || value === '1') {
      return 'true';
    }

    if (value === 'false' || value === '0') {
      return 'false';
    }

    throw new BadRequestException(
      'completed must be one of: true, false, 1, or 0',
    );
  }
}
