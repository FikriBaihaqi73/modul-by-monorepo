# 02. Implementasi Controller (Studi Kasus: User Controller)

Berikut adalah contoh implementasi `UserController` di `apps/api/src/user/user.controller.ts`.

---

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import { CreateUserDto, UpdateUserDto } from "@repo/shared/schemas/user.schema";
import { UserService } from "./user.service";

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 1. GET /users - List All Users
  @Get()
  @ApiOperation({ summary: "Get list of all users" })
  async findAll() {
    const users = await this.userService.findAll();
    return ResponseHelper.success(users, "Users retrieved successfully");
  }

  // 2. GET /users/:id - Get User Detail
  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  async findOne(@Param("id") id: string) {
    const user = await this.userService.findOne(id);
    return ResponseHelper.success(user, "User detail retrieved successfully");
  }

  // 3. POST /users - Create New User
  @Post()
  @ApiOperation({ summary: "Create a new user" })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return ResponseHelper.success(user, "User created successfully", 201);
  }

  // 4. PATCH /users/:id - Update User
  @Patch(":id")
  @ApiOperation({ summary: "Update an existing user" })
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.update(id, updateUserDto);
    return ResponseHelper.success(user, "User updated successfully");
  }

  // 5. DELETE /users/:id - Remove User
  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  async remove(@Param("id") id: string) {
    const result = await this.userService.remove(id);
    return ResponseHelper.success(result, "User deleted successfully");
  }
}
```

---

## 💡 Poin Penting Implementasi Controller

1. **Bersih & Rapi**: Controller fokus hanya pada pengaturan route, penerimaan data request, dan pemanggilan Service.
2. **Standard Response**: Semua return value dibungkus dengan `ResponseHelper.success(data, message, statusCode)`.
3. **Swagger Integration**: `@ApiTags('Users')` mengelompokkan API di Scalar UI, sementara `@ApiOperation` menjelaskan kegunaan setiap endpoint secara ringkas.
