import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sourceScript = path.resolve(process.cwd(), 'scripts', 'lesson.mjs');
const tempRepos: string[] = [];

function git(repo: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd: repo,
    encoding: 'utf8',
  });
}

function createRepo({ objectFormat }: { objectFormat?: string } = {}): string {
  const repo = mkdtempSync(path.join(os.tmpdir(), 'lesson-script-test-'));
  tempRepos.push(repo);
  mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  mkdirSync(path.join(repo, 'docs', 'lessons', '00-setup'), {
    recursive: true,
  });
  copyFileSync(sourceScript, path.join(repo, 'scripts', 'lesson.mjs'));
  const initArgs = ['init', '-b', 'main'];
  // objectFormat lets the fixture use SHA-256 and catch hardcoded SHA-1 empty-tree hashes.
  if (objectFormat) {
    initArgs.push(`--object-format=${objectFormat}`);
  }
  git(repo, initArgs);
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Lesson Test']);
  return repo;
}

function commit(repo: string, message: string): string {
  git(repo, ['add', '.']);
  // --no-gpg-sign keeps fixture commits independent from the host GPG configuration.
  git(repo, ['commit', '-m', message, '--no-gpg-sign']);
  return git(repo, ['rev-parse', 'HEAD']).trim();
}

function runLesson(repo: string, args: string[]) {
  const result = spawnSync(
    process.execPath,
    [path.join(repo, 'scripts', 'lesson.mjs'), ...args],
    {
      cwd: repo,
      encoding: 'utf8',
    },
  );

  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
  };
}

beforeEach(() => {
  tempRepos.length = 0;
});

afterEach(() => {
  for (const repo of tempRepos) {
    rmSync(repo, { recursive: true, force: true });
  }
  tempRepos.length = 0;
});

describe('scripts/lesson.mjs', () => {
  it('diffs the first lesson from the Git empty tree', () => {
    const repo = createRepo();
    writeFileSync(path.join(repo, 'root.txt'), 'root\n');
    commit(repo, 'setup');
    writeFileSync(path.join(repo, 'lesson.txt'), 'lesson\n');
    const lessonCommit = commit(repo, 'lesson 01');
    git(repo, ['tag', 'lesson/01', lessonCommit]);

    const result = runLesson(repo, ['01']);

    expect(result.status).toBe(0);
    expect(result.output).toContain('root.txt');
    expect(result.output).toContain('lesson.txt');
  });

  // This guards against using the SHA-1 empty-tree hash in a SHA-256 repository.
  it('diffs the first lesson from the Git empty tree in a SHA-256 repo', () => {
    const repo = createRepo({ objectFormat: 'sha256' });
    writeFileSync(path.join(repo, 'root.txt'), 'root\n');
    commit(repo, 'setup');
    writeFileSync(path.join(repo, 'lesson.txt'), 'lesson\n');
    const lessonCommit = commit(repo, 'lesson 01');
    git(repo, ['tag', 'lesson/01', lessonCommit]);

    const result = runLesson(repo, ['01']);

    expect(result.status).toBe(0);
    expect(result.output).toContain('root.txt');
    expect(result.output).toContain('lesson.txt');
  });

  it('classifies renames even when Git rename detection is disabled', () => {
    const repo = createRepo();
    writeFileSync(path.join(repo, 'old.txt'), 'same content\n');
    const firstCommit = commit(repo, 'lesson 01');
    git(repo, ['tag', 'lesson/01', firstCommit]);
    git(repo, ['config', 'diff.renames', 'false']);
    git(repo, ['mv', 'old.txt', 'new.txt']);
    const secondCommit = commit(repo, 'lesson 02');
    git(repo, ['tag', 'lesson/02', secondCommit]);

    const result = runLesson(repo, ['02']);

    expect(result.status).toBe(0);
    expect(result.output).toContain('old.txt → new.txt');
  });

  it.each(['abc', '123'])(
    'rejects invalid lesson number "%s" before tagging',
    (value) => {
      const repo = createRepo();
      writeFileSync(path.join(repo, 'README.md'), 'test\n');
      commit(repo, 'setup');

      const result = runLesson(repo, ['--tag', value]);

      expect(result.status).not.toBe(0);
      expect(result.output).toContain('Invalid lesson number');
      expect(git(repo, ['tag', '-l'])).toBe('');
    },
  );

  it('rejects a dirty tree including untracked files before tagging', () => {
    const repo = createRepo();
    writeFileSync(path.join(repo, 'README.md'), 'test\n');
    commit(repo, 'setup');
    git(repo, ['config', 'status.showUntrackedFiles', 'no']);
    writeFileSync(path.join(repo, 'untracked.txt'), 'not committed\n');

    const result = runLesson(repo, ['--tag', '03']);

    expect(result.status).not.toBe(0);
    expect(result.output).toContain('Working tree has uncommitted changes');
    expect(git(repo, ['tag', '-l'])).toBe('');
  });
});
