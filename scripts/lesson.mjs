#!/usr/bin/env node
/**
 * Lesson Snapshot — xem file map & đọc code của từng lesson.
 *
 * Ý tưởng: mỗi lesson = squash commit trên main (ADR-0003), đánh dấu bằng git tag
 * `lesson/NN`. Script này chỉ "trình bày lại" git — không duy trì bảng tay nào nên
 * không bao giờ lệch với code thật.
 *
 * Usage:
 *   node scripts/lesson.mjs                  # liệt kê mọi lesson (tag + slug)
 *   node scripts/lesson.mjs <NN>             # file map lesson NN (diff vs lesson trước)
 *   node scripts/lesson.mjs <NN> <path>      # in nội dung file tại tag lesson/NN (có số dòng)
 *   node scripts/lesson.mjs --diff <A> <B>   # diff stat giữa 2 lesson
 *   node scripts/lesson.mjs --tag <NN>       # tạo tag lesson/NN tại HEAD (chỉ trên main)
 *   node scripts/lesson.mjs --note <NN>      # in đường dẫn lesson note của lesson NN
 *
 * Zero dependency — chỉ dùng Node stdlib + git CLI.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const LESSONS_DIR = path.join(ROOT, 'docs', 'lessons');
// Empty tree là mốc Git không chứa file nào; lesson đầu phải diff từ mốc này.
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

/** Chạy lệnh git, trả stdout (trim). Exit code khác 0 → throw. */
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
      console.error(`❌ git ${args.join(' ')} thất bại:\n  ${msg}`);
    }
    throw err;
  }
}

/** Chuẩn hóa "1" → "01". */
function pad(nn) {
  return String(nn).padStart(2, '0');
}

/** Map NN → slug từ thư mục docs/lessons (pattern `<NN>-<slug>`). */
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

/** Tag lesson của lesson trước liền kề (bé hơn NN). Không có → empty tree. */
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
  return EMPTY_TREE;
}

function classify(file) {
  if (file.startsWith('src/') && file.endsWith('.spec.ts')) return '🧪 unit test';
  if (file.startsWith('src/')) return '🟦 code';
  if (file.startsWith('test/')) return '🧪 e2e test';
  if (file.startsWith('docs/')) return '📄 docs';
  return '⚙️ misc';
}

function printList() {
  const slugs = lessonSlugs();
  const tags = new Set(git(['tag', '-l', 'lesson/*']).split('\n').filter(Boolean));
  console.log('📚 Danh sách lesson:');
  console.log('');
  if (slugs.size === 0 && tags.size === 0) {
    console.log('  (chưa có lesson nào — chạy `node scripts/lesson.mjs --tag <NN>` khi xong lesson)');
    return;
  }
  const rows = [];
  for (const [nn, slug] of [...slugs.entries()].sort()) {
    rows.push([nn, slug, tags.has(`lesson/${nn}`) ? '✅ có tag' : '⬜ chưa tag']);
  }
  for (const [nn, slug, status] of rows) {
    console.log(`  lesson ${nn} — ${slug.padEnd(16)} ${status}`);
  }
  console.log('');
  console.log('Xem file map:  node scripts/lesson.mjs <NN>');
  console.log('Đọc 1 file:   node scripts/lesson.mjs <NN> <path>');
  console.log('Đánh tag:     node scripts/lesson.mjs --tag <NN>');
}

function printFileMap(nn, slugs) {
  const tag = `lesson/${nn}`;
  const tags = git(['tag', '-l', tag]);
  if (!tags) {
    console.error(`❌ Chưa có tag ${tag}.`);
    console.error(`   Đánh dấu lesson này xong: node scripts/lesson.mjs --tag ${nn}`);
    process.exit(1);
  }
  const prev = prevTag(parseInt(nn, 10));
  const created = git(['diff', '--diff-filter=A', '--name-only', `${prev}..${tag}`])
    .split('\n')
    .filter(Boolean);
  const modified = git(['diff', '--diff-filter=M', '--name-only', `${prev}..${tag}`])
    .split('\n')
    .filter(Boolean);
  // --name-status giữ lại cả hai đường dẫn của rename (old và new), thay vì chỉ tên mới.
  const renamed = git(['diff', '--diff-filter=R', '--name-status', `${prev}..${tag}`])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [, oldPath, newPath] = line.split('\t');
      return { oldPath, newPath };
    });
  const deleted = git(['diff', '--diff-filter=D', '--name-only', `${prev}..${tag}`])
    .split('\n')
    .filter(Boolean);
  const stat = git(['diff', '--stat', `${prev}..${tag}`]);

  console.log(`🗂  File map lesson ${lessonTitle(nn, slugs)}`);
  console.log(`   (diff ${prev} → ${tag})`);
  console.log('');
  console.log('🆕 File mới:');
  if (created.length === 0) console.log('   (không có)');
  for (const f of created) console.log(`   ${classify(f).padEnd(12)} ${f}`);
  console.log('');
  console.log('✏️  File sửa:');
  if (modified.length === 0) console.log('   (không có)');
  for (const f of modified) console.log(`   ${classify(f).padEnd(12)} ${f}`);
  console.log('');
  console.log('🔁 File đổi tên:');
  if (renamed.length === 0) console.log('   (không có)');
  for (const { oldPath, newPath } of renamed) {
    console.log(`   ${classify(newPath).padEnd(12)} ${oldPath} → ${newPath}`);
  }
  if (deleted.length > 0) {
    console.log('');
    console.log('🗑  File xóa:');
    for (const f of deleted) console.log(`   ${classify(f).padEnd(12)} ${f}`);
  }
  console.log('');
  console.log('📊 Tóm tắt:');
  console.log(stat.split('\n').map((l) => `   ${l}`).join('\n'));
  const note = notePath(nn, slugs);
  if (note) {
    console.log('');
    console.log(`📄 Lesson note: ${note}`);
    console.log(`   Mở bằng: node scripts/lesson.mjs --note ${nn}`);
  }
  console.log('');
  console.log(`Đọc từng file code: node scripts/lesson.mjs ${nn} <path>`);
}

function printFile(nn, file, slugs) {
  const tag = `lesson/${nn}`;
  let content;
  try {
    content = git(['show', `${tag}:${file}`], { silent: true });
  } catch {
    console.error(`❌ Không tìm thấy file "${file}" tại ${tag}.`);
    console.error(`   Xem danh sách file của lesson ${nn}: node scripts/lesson.mjs ${nn}`);
    process.exit(1);
  }
  console.log(`📄 ${file} — tại ${tag} (lesson ${lessonTitle(nn, slugs)})`);
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
  console.log(`🔀 Diff ${lessonTitle(pad(a), slugs)} → ${lessonTitle(pad(b), slugs)}`);
  console.log('');
  const stat = git(['diff', '--stat', `${ta}..${tb}`]);
  console.log(stat || '   (không có khác biệt)');
}

function createTag(nn) {
  // Tag chỉ nhận số lesson dạng 1–2 chữ số để luôn khớp với lesson/NN.
  if (!/^\d{1,2}$/.test(nn)) {
    console.error(`❌ Số lesson không hợp lệ: "${nn}" (chỉ nhận 1–2 chữ số, ví dụ 0 hoặc 01).`);
    process.exit(1);
  }
  const branch = git(['branch', '--show-current']);
  if (branch !== 'main') {
    console.error(`❌ Chỉ được tag trên main (hiện đang ở branch "${branch}").`);
    console.error(`   Muốn tag tạm trên branch khác: git tag lesson/${nn} <commit>`);
    process.exit(1);
  }
  const tag = `lesson/${nn}`;
  if (git(['tag', '-l', tag])) {
    console.error(`❌ Tag ${tag} đã tồn tại. Xóa thủ công nếu muốn tạo lại: git tag -d ${tag}`);
    process.exit(1);
  }
  // Tag trỏ trực tiếp vào HEAD, nên mọi thay đổi chưa commit phải được xử lý trước.
  const dirty = git(['status', '--porcelain']);
  if (dirty) {
    console.error('❌ Working tree còn thay đổi chưa commit; hãy commit hoặc stash trước khi tạo tag.');
    process.exit(1);
  }
  git(['tag', tag]);
  const info = git(['log', '-1', '--format=%h %s', tag]);
  console.log(`✅ Đã tạo tag ${tag} → ${info}`);
  console.log(`   Xem file map: node scripts/lesson.mjs ${nn}`);
}

function printNote(nn, slugs) {
  const note = notePath(nn, slugs);
  if (!note) {
    console.error(`❌ Không tìm thấy lesson note cho lesson ${nn} (docs/lessons/${nn}-*/README.md).`);
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
      console.error('❌ Cần 2 lesson: node scripts/lesson.mjs --diff <A> <B>');
      process.exit(1);
    }
    printDiff(pad(arg2), pad(process.argv[4]), slugs);
  } else if (arg1 === '--tag') {
    if (!arg2) {
      console.error('❌ Cần số lesson: node scripts/lesson.mjs --tag <NN>');
      process.exit(1);
    }
    createTag(pad(arg2));
  } else if (arg1 === '--note') {
    if (!arg2) {
      console.error('❌ Cần số lesson: node scripts/lesson.mjs --note <NN>');
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
    console.error(`❌ Không hiểu đối số: "${arg1}"`);
    console.error('   Xem hướng dẫn: node scripts/lesson.mjs');
    process.exit(1);
  }
} catch {
  process.exit(1);
}
