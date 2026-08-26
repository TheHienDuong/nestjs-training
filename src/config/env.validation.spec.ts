// [NES-7 · lesson 06] Test — valid and invalid environment configuration.
import {
  EnvironmentVariables,
  NodeEnvironment,
  validate,
} from './env.validation';

describe('environment validation', () => {
  it('returns typed configuration for valid required variables', () => {
    const config = validate({ NODE_ENV: 'test', PORT: '3000' });

    expect(config).toBeInstanceOf(EnvironmentVariables);
    expect(config.NODE_ENV).toBe(NodeEnvironment.Test);
    expect(config.PORT).toBe(3000);
  });

  it.each([
    [{ PORT: '3000' }, 'NODE_ENV'],
    [{ NODE_ENV: 'test' }, 'PORT'],
    [{ NODE_ENV: 'staging', PORT: '3000' }, 'NODE_ENV'],
    [{ NODE_ENV: 'test', PORT: 'not-a-port' }, 'PORT'],
    [{ NODE_ENV: 'test', PORT: '' }, 'PORT'],
  ])('rejects invalid configuration %j (%s)', (config, property) => {
    expect(() => validate(config)).toThrow(property);
  });

  it('rejects ports outside the valid TCP range', () => {
    expect(() => validate({ NODE_ENV: 'test', PORT: '65536' })).toThrow('PORT');
  });
});
