# 02. Implementasi Service (Studi Kasus: User Service)

Berikut adalah contoh lengkap pembuatan `UserService` di `apps/api/src/user/user.service.ts`.

---

```typescript
import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { UserRepository } from "@repo/shared/infrastructure/repository/user.repository";
import type {
  CreateUserDto,
  UpdateUserDto,
} from "@repo/shared/schemas/user.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  private userRepository: UserRepository;

  constructor(private readonly prisma: PrismaService) {
    // Inisialisasi Repository dengan Prisma Client
    this.userRepository = new UserRepository(this.prisma.client);
  }

  // 1. Get All Users
  async findAll() {
    return this.userRepository.findAll();
  }

  // 2. Get User By ID (dengan error check 404)
  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  // 3. Create New User (dengan check username duplikat)
  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException("Username is already taken");
    }

    return this.userRepository.create({
      role_id: dto.role_id,
      username: dto.username,
      password: dto.password,
      is_active: dto.is_active,
    });
  }

  // 4. Update User (dengan penanganan tipe Date pada last_login)
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // Pastikan user ada

    const { last_login, ...rest } = dto;
    return this.userRepository.update(id, {
      ...rest,
      ...(last_login !== undefined
        ? { last_login: last_login ? new Date(last_login) : null }
        : {}),
    });
  }

  // 5. Delete User (Soft Delete)
  async remove(id: string) {
    await this.findOne(id); // Pastikan user ada
    await this.userRepository.delete(id);
    return { success: true, id };
  }
}
```

---

## 🔑 Kunci Penting Implementasi Service

1. **Dependency Injection**: `PrismaService` di-inject via `constructor` NestJS.
2. **Kueri Terisolasi**: Service tidak menulis kueri Prisma langsung, melainkan menyerahkan operasi data ke `userRepository`.
3. **Penyelarasan Tipe**: `last_login` dari DTO bernilai `string` (ISO 8601), sehingga dikonversi ke `new Date(...)` agar sesuai dengan `UpdateUserInput` di repository.
