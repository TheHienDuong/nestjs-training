#!/usr/bin/env node
/**
 * Lesson Snapshot — view the file map and read each lesson's code.
 *
 * Idea: each lesson = a squash commit on main (ADR-0003), marked with git tag
 * `lesson/NN`. This script only "presents" git — it does not maintain any hand-written table, so
 * it never drifts from the actual code.
 *
 * Usage:
 *   node scripts/lesson.mjs                  # list every lesson (tag + slug)
 *   node scripts/lesson.mjs <NN>             # show the file map for lesson NN (diff vs previous lesson)
 *   node scripts/lesson.mjs <NN> <path>      # print file contents at tag lesson/NN (with line numbers)
 *   node scripts/lesson.mjs --diff <A> <B>   # diff stat between two lessons
 *   node scripts/lesson.mjs --tag <NN>       # create tag lesson/NN at HEAD (main only)
 *   node scripts/lesson.mjs --note <NN>      # print the lesson note path for lesson NN
 *
 * Zero dependency — uses only Node stdlib + git CLI.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const LESSONS_DIR = path.join(ROOT, 'docs', 'lessons');

/**
 * The empty tree is Git's marker for a tree with no files. Do not hardcode the
 * SHA-1 hash (`4b825dc...`), because SHA-256 repositories use a different hash.
 * `git mktree` with empty input derives the correct object for this repository's
 * object format and stores it so that `git diff` can resolve it.
 */
function emptyTreeHash() {
  return execFileSync('git', ['mktree'], {
    cwd: ROOT,
    encoding: 'utf8',
    input: '',
  }).trim();
}

/** Run a git command and return stdout (trimmed). A non-zero exit code → throw. */
function git(args, { silent = false } = {}) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: silent ? 'pipe' : ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    const msg = err.stderr ? err.stderr.toString().trim() : err.message;
    if (!silent) {
      console.error(`❌ git ${args.join(' ')} failed:\n  ${msg}`);
    }
    throw err;
  }
}

/** Normalize "1" → "01". */
function pad(nn) {
  return String(nn).padStart(2, '0');
}

/** Map NN → slug from the docs/lessons directory (pattern `<NN>-<slug>`). */
function lessonSlugs() {
  const slugs = new Map();
  if (existsSync(LESSONS_DIR)) {
    for (const entry of readdirSync(LESSONS_DIR)) {
      const m = /^(\d{2})-([\w-]+)$/.exec(entry);
      if (m) slugs.set(m[1], m[2]);
    }
  }
  return slugs;
}

function lessonTitle(nn, slugs) {
  const slug = slugs.get(nn);
  if (slug) return `${nn}-${slug}`;
  const subject = git(['log', '-1', '--format=%s', `lesson/${nn}`], { silent: true });
  return subject || `lesson ${nn}`;
}

function notePath(nn, slugs) {
  const slug = slugs.get(nn);
  if (!slug) return null;
  const p = path.join(LESSONS_DIR, `${nn}-${slug}`, 'README.md');
  return existsSync(p) ? path.relative(ROOT, p) : null;
}

/** Tag the immediately preceding lesson (less than NN). If none exists → empty tree. */
function prevTag(nn) {
  const tags = git(['tag', '-l', 'lesson/*'])
    .split('\n')
    .filter((t) => t.startsWith('lesson/'))
    .map((t) => t.slice('lesson/'.length))
    .filter((t) => /^\d{2}$/.test(t))
    .map((t) => parseInt(t, 10))
    .filter((n) => n < nn)
    .sort((a, b) => b - a);
  if (tags.length > 0) return `lesson/${pad(tags[0])}`;
  return emptyTreeHash();
}

function classify(file) {
  if (file.startsWith('src/') && file.endsWith('.spec.ts'))
    return '🧪 unit test';
  if (file.startsWith('src/')) return '🟦 code';
  if (file.startsWith('test/')) return '🧪 e2e test';
  if (file.startsWith('docs/')) return '📄 docs';
  return '⚙️ misc';
}

function printList() {
  const slugs = lessonSlugs();
  const tags = new Set(
    git(['tag', '-l', 'lesson/*']).split('\n').filter(Boolean),
  );
  console.log('📚 Lesson list:');
  console.log('');
  if (slugs.size === 0 && tags.size === 0) {
    console.log(
      '  (no lessons yet — run `node scripts/lesson.mjs --tag <NN>` when the lesson is complete)',
    );
    return;
  }
  const rows = [];
  for (const [nn, slug] of [...slugs.entries()].sort()) {
    rows.push([
      nn,
      slug,
      tags.has(`lesson/${nn}`) ? '✅ tagged' : '⬜ not tagged',
    ]);
  }
  for (const [nn, slug, status] of rows) {
    console.log(`  lesson ${nn} — ${slug.padEnd(16)} ${status}`);
  }
  console.log('');
  console.log('View file map:  node scripts/lesson.mjs <NN>');
  console.log('Read 1 file:   node scripts/lesson.mjs <NN> <path>');
  console.log('Tag:            node scripts/lesson.mjs --tag <NN>');
}

function printFileMap(nn, slugs) {
  const tag = `lesson/${nn}`;
  const tags = git(['tag', '-l', tag]);
  if (!tags) {
    console.error(`❌ Tag ${tag} does not exist.`);
    console.error(
      `   Mark this lesson complete: node scripts/lesson.mjs --tag ${nn}`,
    );
    process.exit(1);
  }
  const prev = prevTag(parseInt(nn, 10));
  const created = git([
    'diff',
    '--find-renames',
    '--diff-filter=A',
    '--name-only',
    `${prev}..${tag}`,
  ])
    .split('\n')
    .filter(Boolean);
  const modified = git([
    'diff',
    '--find-renames',
    '--diff-filter=M',
    '--name-only',
    `${prev}..${tag}`,
  ])
    .split('\n')
    .filter(Boolean);
  // --name-status keeps both paths of a rename (old and new), not only the new name.
  const renamed = git([
    'diff',
    '--find-renames',
    '--diff-filter=R',
    '--name-status',
    `${prev}..${tag}`,
  ])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [, oldPath, newPath] = line.split('\t');
      return { oldPath, newPath };
    });
  const deleted = git([
    'diff',
    '--find-renames',
    '--diff-filter=D',
    '--name-only',
    `${prev}..${tag}`,
  ])
    .split('\n')
    .filter(Boolean);
  const stat = git(['diff', '--find-renames', '--stat', `${prev}..${tag}`]);

  console.log(`🗂  File map lesson ${lessonTitle(nn, slugs)}`);
  console.log(`   (diff ${prev} → ${tag})`);
  console.log('');
  console.log('🆕 New files:');
  if (created.length === 0) console.log('   (none)');
  for (const f of created) console.log(`   ${classify(f).padEnd(12)} ${f}`);
  console.log('');
  console.log('✏️  Modified files:');
  if (modified.length === 0) console.log('   (none)');
  for (const f of modified) console.log(`   ${classify(f).padEnd(12)} ${f}`);
  console.log('');
  console.log('🔁 Renamed files:');
  if (renamed.length === 0) console.log('   (none)');
  for (const { oldPath, newPath } of renamed) {
    console.log(`   ${classify(newPath).padEnd(12)} ${oldPath} → ${newPath}`);
  }
  if (deleted.length > 0) {
    console.log('');
    console.log('🗑  Deleted files:');
    for (const f of deleted) console.log(`   ${classify(f).padEnd(12)} ${f}`);
  }
  console.log('');
  console.log('📊 Summary:');
  console.log(
    stat
      .split('\n')
      .map((l) => `   ${l}`)
      .join('\n'),
  );
  const note = notePath(nn, slugs);
  if (note) {
    console.log('');
    console.log(`📄 Lesson note: ${note}`);
    console.log(`   Open with: node scripts/lesson.mjs --note ${nn}`);
  }
  console.log('');
  console.log(`Read each code file: node scripts/lesson.mjs ${nn} <path>`);
}

function printFile(nn, file, slugs) {
  const tag = `lesson/${nn}`;
  let content;
  try {
    content = git(['show', `${tag}:${file}`], { silent: true });
  } catch {
    console.error(`❌ File not found "${file}" at ${tag}.`);
    console.error(
      `   See the file list for lesson ${nn}: node scripts/lesson.mjs ${nn}`,
    );
    process.exit(1);
  }
  console.log(`📄 ${file} — at ${tag} (lesson ${lessonTitle(nn, slugs)})`);
  console.log('');
  const lines = content.split('\n');
  const width = String(lines.length).length;
  lines.forEach((line, i) => {
    console.log(`${String(i + 1).padStart(width)}| ${line}`);
  });
}

function printDiff(a, b, slugs) {
  const ta = `lesson/${pad(a)}`;
  const tb = `lesson/${pad(b)}`;
  console.log(
    `🔀 Diff ${lessonTitle(pad(a), slugs)} → ${lessonTitle(pad(b), slugs)}`,
  );
  console.log('');
  const stat = git(['diff', '--find-renames', '--stat', `${ta}..${tb}`]);
  console.log(stat || '   (no differences)');
}

function createTag(nn) {
  // Tags accept only a one- or two-digit lesson number to match lesson/NN.
  if (!/^\d{1,2}$/.test(nn)) {
    console.error(
      `❌ Invalid lesson number: "${nn}" (use 1–2 digits, for example 0 or 01).`,
    );
    process.exit(1);
  }
  const branch = git(['branch', '--show-current']);
  if (branch !== 'main') {
    console.error(
      `❌ Tags may only be created on main (currently on branch "${branch}").`,
    );
    console.error(
      `   To create a temporary tag on another branch: git tag lesson/${nn} <commit>`,
    );
    process.exit(1);
  }
  const tag = `lesson/${nn}`;
  if (git(['tag', '-l', tag])) {
    console.error(
      `❌ Tag ${tag} already exists. Delete it manually to recreate it: git tag -d ${tag}`,
    );
    process.exit(1);
  }
  // A tag points directly to HEAD, so all uncommitted changes must be handled first.
  const dirty = git(['status', '--porcelain', '--untracked-files=all']);
  if (dirty) {
    console.error(
      '❌ Working tree has uncommitted changes; commit or stash them before creating a tag.',
    );
    process.exit(1);
  }
  git(['tag', tag]);
  const info = git(['log', '-1', '--format=%h %s', tag]);
  console.log(`✅ Created tag ${tag} → ${info}`);
  console.log(`   View file map: node scripts/lesson.mjs ${nn}`);
}

function printNote(nn, slugs) {
  const note = notePath(nn, slugs);
  if (!note) {
    console.error(
      `❌ Lesson note not found for lesson ${nn} (docs/lessons/${nn}-*/README.md).`,
    );
    process.exit(1);
  }
  console.log(path.join(ROOT, note));
}

const [arg1, arg2] = process.argv.slice(2);
const slugs = lessonSlugs();

try {
  if (arg1 === undefined) {
    printList();
  } else if (arg1 === '--diff') {
    if (!arg2 || !process.argv[4]) {
      console.error(
        '❌ Two lessons are required: node scripts/lesson.mjs --diff <A> <B>',
      );
      process.exit(1);
    }
    printDiff(pad(arg2), pad(process.argv[4]), slugs);
  } else if (arg1 === '--tag') {
    if (!arg2) {
      console.error(
        '❌ A lesson number is required: node scripts/lesson.mjs --tag <NN>',
      );
      process.exit(1);
    }
    createTag(pad(arg2));
  } else if (arg1 === '--note') {
    if (!arg2) {
      console.error(
        '❌ A lesson number is required: node scripts/lesson.mjs --note <NN>',
      );
      process.exit(1);
    }
    printNote(pad(arg2), slugs);
  } else if (/^\d{1,2}$/.test(arg1)) {
    const nn = pad(arg1);
    if (arg2) {
      printFile(nn, arg2, slugs);
    } else {
      printFileMap(nn, slugs);
    }
  } else {
    console.error(`❌ Unknown argument: "${arg1}"`);
    console.error('   See the usage guide: node scripts/lesson.mjs');
    process.exit(1);
  }
} catch {
  process.exit(1);
}
