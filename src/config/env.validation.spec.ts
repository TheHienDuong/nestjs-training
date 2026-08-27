import {
  EnvironmentVariables,
  NodeEnvironment,
  validate,
} from './env.validation';

const databaseUrl =
  'postgresql://postgres:postgres@localhost:5433/nestjs_training?schema=public';

// [NES-7 · lesson 06] Test — valid and invalid environment configuration.
describe('environment validation', () => {
  it('returns typed configuration for valid required variables', () => {
    const config = validate({
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL: databaseUrl,
    });

    expect(config).toBeInstanceOf(EnvironmentVariables);
    expect(config.NODE_ENV).toBe(NodeEnvironment.Test);
    expect(config.PORT).toBe(3000);
    expect(config.DATABASE_URL).toBe(databaseUrl);
  });

  it.each([
    [{ PORT: '3000', DATABASE_URL: databaseUrl }, 'NODE_ENV'],
    [{ NODE_ENV: 'test', DATABASE_URL: databaseUrl }, 'PORT'],
    [{ NODE_ENV: 'test', PORT: '3000' }, 'DATABASE_URL'],
    [
      { NODE_ENV: 'staging', PORT: '3000', DATABASE_URL: databaseUrl },
      'NODE_ENV',
    ],
    [
      { NODE_ENV: 'test', PORT: 'not-a-port', DATABASE_URL: databaseUrl },
      'PORT',
    ],
    [{ NODE_ENV: 'test', PORT: '', DATABASE_URL: databaseUrl }, 'PORT'],
    [
      { NODE_ENV: 'test', PORT: '3000', DATABASE_URL: 'not a url' },
      'DATABASE_URL',
    ],
  ])('rejects invalid configuration %j (%s)', (config, property) => {
    expect(() => validate(config)).toThrow(property);
  });

  it('rejects ports outside valid TCP range', () => {
    expect(() =>
      validate({
        NODE_ENV: 'test',
        PORT: '65536',
        DATABASE_URL: databaseUrl,
      }),
    ).toThrow('PORT');
  });
});
