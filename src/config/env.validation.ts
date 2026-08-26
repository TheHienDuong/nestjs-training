// [NES-7 · lesson 06] Reference — environment variable validation.
import { plainToInstance } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNumber,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsDefined()
  @IsEnum(NodeEnvironment)
  NODE_ENV!: NodeEnvironment;

  @IsDefined()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT!: number;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const configWithPortNumber = { ...config };
  const rawPort = configWithPortNumber.PORT;

  // Do not let an empty string become 0 through implicit numeric conversion.
  if (typeof rawPort === 'string' && rawPort.trim() !== '') {
    configWithPortNumber.PORT = Number(rawPort);
  }

  const validated = plainToInstance(EnvironmentVariables, configWithPortNumber);
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors.flatMap(({ property, constraints }) =>
      Object.values(constraints ?? {}).map(
        (message) => `${property}: ${message}`,
      ),
    );

    throw new Error(`Environment validation failed: ${messages.join('; ')}`);
  }

  return validated;
}
