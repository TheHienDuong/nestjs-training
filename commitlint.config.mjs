/**
 * Commit message validation for the repository.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'test', 'refactor', 'chore', 'style', 'perf', 'revert'],
    ],
    'subject-max-length': [2, 'always', 100],
    'subject-case': [0],
  },
};
