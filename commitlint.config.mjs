/**
 * commitlint — checks commit messages against the Conventional Commits standard.
 * Runs through the .husky/commit-msg git hook
 *
 * Format:  <type>(<scope>): <description>
 * Valid examples: feat(tasks): add CRUD endpoints for tasks
 *                 docs(lesson-02): notes about controllers and routing
 *             chore: bump @nestjs/core to 11.1.28
 *
 * Why enforce the format:
 *   - Git history reads like a changelog, not a list of "update", "fix bug".
 *   - Type + scope IMMEDIATELY show what kind of change a commit contains without opening the diff.
 *   - It is the foundation for automatically generating a CHANGELOG and semantic versions later.
 *
 * See the complete conventions in docs/workflow/WORKFLOW.md
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Limit types to avoid inventing a new type every day.
    'type-enum': [
      2,
      'always',
      [
        'feat', // add API functionality
        'fix', // fix bugs
        'docs', // lesson note, README, ADR
        'test', // add/update tests
        'refactor', // change structure without changing behavior
        'chore', // config, dependency, CI
        'style', // formatting without changing logic
        'perf', // optimize performance
        'revert', // revert a previous commit
      ],
    ],
    // Allow a longer subject than the default because Vietnamese descriptions require more characters.
    'subject-max-length': [2, 'always', 100],
    // Disable: the original rule forbids subjects starting with uppercase letters, but Vietnamese
    // usually capitalizes the first word of a sentence, and proper names (Prisma, NestJS) are also capitalized.
    'subject-case': [0],
  },
};
