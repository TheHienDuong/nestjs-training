# ADR-0001: Chọn Prisma làm ORM thay vì TypeORM

- **Trạng thái:** Accepted
- **Ngày:** 2026-08-10
- **Người quyết định:** Hien Duong

## Bối cảnh

Dự án cần một tầng truy cập PostgreSQL. Hai lựa chọn thực tế:

- **TypeORM** — là ORM được dùng làm ví dụ chính trong tài liệu NestJS ([/techniques/database](https://docs.nestjs.com/techniques/database)), có package chính chủ `@nestjs/typeorm`, tích hợp sâu với DI của Nest qua pattern `@InjectRepository`.
- **Prisma** — có recipe chính thức riêng ([/recipes/prisma](https://docs.nestjs.com/recipes/prisma)), schema-first, sinh type từ schema.

Ràng buộc riêng của dự án này: **đây là dự án học tập, và người học đã dùng Prisma ở một dự án Express + hexagonal architecture trước đó.**

## Quyết định

Dùng **Prisma + PostgreSQL** làm tầng dữ liệu chính. Lesson notes sẽ có phần đối chiếu ngắn "TypeORM làm việc tương tự thế nào" để vẫn đọc hiểu được docs NestJS và các codebase dùng TypeORM.

## Các phương án đã cân nhắc

| Phương án              | Ưu                                                                                                                                                          | Nhược                                                                                                                  | Vì sao không chọn                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Prisma** _(đã chọn)_ | Tái dùng kiến thức sẵn có → tách bạch được "cái gì mới của Nest" và "cái gì mới của ORM"; type-safety tốt; migration workflow rõ ràng; có recipe chính thức | Không phải ví dụ mặc định trong docs Nest; là client sinh ra sẵn nên khó thấy pattern Repository của Nest              | —                                               |
| **TypeORM**            | Theo sát docs NestJS nhất; `@InjectRepository` dạy được cách DI hoạt động với dữ liệu; nhiều công ty VN đang dùng                                           | Học đồng thời ORM mới + framework mới → khó biết lỗi đến từ đâu; decorator-based entity dễ nhầm với decorator của Nest | Trộn hai biến số mới cùng lúc làm chậm việc học |
| **Cả hai song song**   | Bao phủ rộng nhất                                                                                                                                           | Gấp đôi khối lượng, dễ bỏ dở                                                                                           | Không phù hợp cho người mới bắt đầu             |

## Hệ quả

**Tích cực**

- Ở Phase 2, phần "mới" duy nhất cần học là _cách bọc Prisma vào hệ thống DI của Nest_ — không phải học lại cách viết query. Đúng tinh thần: mỗi lesson chỉ thêm một biến số mới.
- Tạo được cầu nối trực tiếp về Phase 7 / L25 (hexagonal): so sánh cùng một Prisma schema đặt trong hai kiến trúc khác nhau.

**Cái giá phải trả**

- Khi đọc docs NestJS về database, ví dụ code sẽ là TypeORM → phải tự dịch sang Prisma. Đây thực ra là **kỹ năng cần có**: đọc ví dụ bằng công nghệ A và áp dụng cho công nghệ B.
- Không được học pattern `@InjectRepository` một cách tự nhiên → bù bằng một mục đối chiếu trong lesson note L07.

**Cần làm tiếp**

- L07: viết `PrismaService` extends `PrismaClient`, implement `OnModuleInit` — chính là chỗ Prisma gặp DI của Nest.
- L07 note: thêm mục _"Nếu bạn gặp TypeORM ở dự án khác"_ để đọc hiểu được code TypeORM.
- Kiểm tra major version của Prisma tại thời điểm học (Prisma đổi khá nhanh giữa các major, đặc biệt cách khai báo generator/output).
