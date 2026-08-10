/**
 * commitlint — kiểm tra commit message theo chuẩn Conventional Commits.
 * Chạy qua git hook .husky/commit-msg
 *
 * Định dạng:  <type>(<scope>): <mô tả>
 * Ví dụ đúng: feat(tasks): add CRUD endpoints for tasks
 *             docs(lesson-02): note về controllers và routing
 *             chore: bump @nestjs/core to 11.1.28
 *
 * Vì sao ràng buộc format:
 *   - Lịch sử git đọc được như changelog, không phải một danh sách "update", "fix bug".
 *   - Type + scope cho biết NGAY một commit thuộc loại gì mà không cần mở diff.
 *   - Là tiền đề để về sau tự sinh CHANGELOG và semantic version.
 *
 * Xem toàn bộ quy ước trong docs/workflow/WORKFLOW.md
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Giới hạn type để tránh mỗi hôm bịa một type mới.
    'type-enum': [
      2,
      'always',
      [
        'feat', // thêm tính năng cho API
        'fix', // sửa lỗi
        'docs', // lesson note, README, ADR
        'test', // thêm/sửa test
        'refactor', // đổi cấu trúc, không đổi hành vi
        'chore', // config, dependency, CI
        'style', // format, không đổi logic
        'perf', // tối ưu hiệu năng
        'revert', // hoàn tác commit trước
      ],
    ],
    // Cho phép subject dài hơn mặc định vì mô tả bằng tiếng Việt tốn ký tự hơn.
    'subject-max-length': [2, 'always', 100],
    // Tắt: quy tắc gốc cấm subject bắt đầu bằng chữ hoa, nhưng tiếng Việt
    // thường viết hoa đầu câu và tên riêng (Prisma, NestJS) cũng viết hoa.
    'subject-case': [0],
  },
};
