/**
  * commitlint — checks commit messages against the Conventional Commits standard.
  * Run through the .husky/commit-msg git hook
 *
  * Format:  <type>(<scope>): <description>
  * Correct example: feat(tasks): add CRUD endpoints for tasks
  * docs(lesson-02): notes on controllers and routing
 *             chore: bump @nestjs/core to 11.1.28
 *
  * Why format constraints:
  * - Git history should be readable like a changelog, not a list of "update", "fix bug" commits.
  * - Type + scope tells you immediately what type a commit is without needing to open the diff.
  * - Serves as a prerequisite for automatically generating CHANGELOG and semantic version at a later stage.
 *
  * View all conventions in docs/workflow/WORKFLOW.md
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Limit types to avoid inventing a new type every day.
    'type-enum': [
      2,
      'always',
      [
        'feat', // Add features to the API
        'fix', // bug fix
        'docs', // lesson note, README, ADR
        'test', // add/edit test
        'refactor', // Change the structure, without changing the behavior.
        'chore', // config, dependency, CI
        'style', // format, do not change logic
        'perf', // performance optimization
        'revert', // undo the previous commit
      ],
    ],
    // Allow the subject to be longer than the default, as Vietnamese descriptions consume more characters.
    'subject-max-length': [2, 'always', 100],
    // Off: the original rule prohibits subjects from starting with uppercase letters, but for Vietnamese
    // Usually capitalize the first word of a sentence, as well as proper nouns (Prisma, NestJS).
    'subject-case': [0],
  },
};
