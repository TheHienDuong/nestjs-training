/**
 * commitlint — validates commit messages against the Conventional Commits standard.
 * Runs via the .husky/commit-msg git hook
 *
 * Format:     <type>(<scope>): <description>
 * Good examples: feat(tasks): add CRUD endpoints for tasks
 *             docs(lesson-02): note about controllers and routing
 *             chore: bump @nestjs/core to 11.1.28
 *
 * Why enforce this format:
 *   - Git history reads like a changelog, not a list of "update", "fix bug".
 *   - Type + scope tells you IMMEDIATELY what kind of commit it is without opening the diff.
 *   - It's a prerequisite for later auto-generating CHANGELOGs and semantic versions.
 *
 * See the full conventions in docs/workflow/WORKFLOW.md
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Limit the types to avoid making up a new type every other day.
    'type-enum': [
      2,
      'always',
      [
        'feat', // add a feature to the API
        'fix', // fix a bug
        'docs', // lesson note, README, ADR
        'test', // add/edit tests
        'refactor', // restructure code without changing behavior
        'chore', // config, dependency, CI
        'style', // formatting, no logic change
        'perf', // performance optimization
        'revert', // revert a previous commit
      ],
    ],
    // Allow a longer subject than the default since descriptions may take more characters.
    'subject-max-length': [2, 'always', 100],
    // Disabled: the default rule forbids the subject from starting with an uppercase letter, but
    // sentences are often capitalized at the start and proper nouns (Prisma, NestJS) are also capitalized.
    'subject-case': [0],
  },
};
