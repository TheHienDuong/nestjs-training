<!--
Template này tự xuất hiện mỗi khi bạn mở PR.
Vì sao cần: PR description là thứ người review (và chính bạn 6 tháng sau) đọc TRƯỚC khi đọc code.
Một PR không có mô tả buộc người đọc phải tự suy ra ý định từ diff — rất dễ suy sai.
-->

## Lesson / Task

<!-- BẮT BUỘC: dòng dưới đây là thứ khiến Linear tự chuyển issue sang Done khi PR merge.
     Viết sai mã hoặc xoá dòng này -> mất tự động hoá, và sẽ không có thông báo lỗi nào. -->

Fixes NES-XX

## Tôi đã làm gì

<!-- 2-4 gạch đầu dòng. Viết ở mức Ý ĐỊNH, không phải liệt kê lại diff.
     Tốt:  "Thêm TasksService lưu dữ liệu in-memory để tách logic khỏi controller"
     Kém:  "Thêm file tasks.service.ts, sửa tasks.controller.ts" -->

-

## Học được gì

<!-- Phần riêng của repo này. Điều gì mới hiểu ra, hoặc điều gì từng hiểu sai? -->

-

## Kiểm tra thế nào

<!-- Người khác phải lặp lại được. Ghi lệnh cụ thể. -->

```bash
pnpm install
pnpm start:dev
# curl ...
```

## Checklist

- [ ] `pnpm lint` sạch
- [ ] `pnpm test` pass
- [ ] `pnpm build` thành công
- [ ] Lesson note đã cập nhật (đủ mục **Liên hệ kiến thức cũ** và **Nguồn**)
- [ ] Đã vượt quiz ở bước `/lesson-review`
- [ ] Không commit secret / file `.env`
- [ ] Đã tự đọc lại diff của chính mình một lượt

## Ghi chú cho người review

<!-- Chỗ nào bạn không tự tin? Chỗ nào muốn được góp ý kỹ? Nói ra sẽ được review đúng chỗ cần. -->
