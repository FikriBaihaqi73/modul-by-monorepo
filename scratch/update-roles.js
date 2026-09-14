const fs = require('fs');
const path = require('path');

const repoPath = 'C:\\fikri\\boilerplate-backend-nestjs\\packages\\shared\\src\\infrastructure\\repository\\role.repository.ts';
const servicePath = 'C:\\fikri\\boilerplate-backend-nestjs\\apps\\api\\src\\role\\role.service.ts';
const controllerPath = 'C:\\fikri\\boilerplate-backend-nestjs\\apps\\api\\src\\role\\role.controller.ts';
const selectPath = 'C:\\fikri\\boilerplate-backend-nestjs\\packages\\shared\\src\\selects\\role.select.ts';

const selectContent = `import type { Prisma } from "#generated/client";

export const roleSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  rolePermissions: true,
} satisfies Prisma.RoleSelect;

export type RoleSelectType = typeof roleSelect;

export type RoleEntity = Prisma.RoleGetPayload<{
  select: RoleSelectType;
}>;
`;

const repoContent = `import type { PrismaClient } from "#generated/client";
import { type RoleEntity, roleSelect } from "#selects/role.select";

export interface CreateRoleInput {
  name: string;
  description?: string | undefined;
}

export interface UpdateRoleInput {
  name?: string | undefined;
  description?: string | undefined;
}

export class RoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateRoleInput): Promise<RoleEntity> {
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
      select: roleSelect,
    });
  }

  async findById(id: string): Promise<RoleEntity | null> {
    return this.prisma.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: roleSelect,
    });
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.prisma.role.findFirst({
      where: {
        name,
        deletedAt: null,
      },
      select: roleSelect,
    });
  }

  async findAll(page: number, limit: number): Promise<{ data: RoleEntity[], meta: any }> {
    const skip = (page - 1) * limit;
    
    const [data, totalData] = await Promise.all([
      this.prisma.role.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take: limit,
        select: roleSelect,
        orderBy: {
          createdAt: 'desc',
        }
      }),
      this.prisma.role.count({
        where: {
          deletedAt: null,
        },
      })
    ]);

    const totalPages = Math.ceil(totalData / limit);

    return {
      data,
      meta: {
        totalData,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    };
  }

  async update(id: string, data: UpdateRoleInput): Promise<RoleEntity> {
    return this.prisma.role.update({
      where: {
        id,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
      select: roleSelect,
    });
  }

  async delete(id: string): Promise<RoleEntity> {
    return this.prisma.role.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
      select: roleSelect,
    });
  }
}
`;

const serviceContent = `import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RoleRepository } from "@repo/shared/infrastructure/repository/role.repository";
import type {
  CreateRoleDto,
  UpdateRoleDto,
} from "@repo/shared/schemas/role.schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoleService {
  private roleRepository: RoleRepository;

  constructor(private readonly prisma: PrismaService) {
    this.roleRepository = new RoleRepository(this.prisma.client);
  }

  async findAll(page: number, limit: number) {
    return this.roleRepository.findAll(page, limit);
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException("Role not found");
    }
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.roleRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException("Role name already exists");
    }
    return this.roleRepository.create({
      name: dto.name,
      ...(dto.description ? { description: dto.description } : {}),
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    if (dto.name) {
      const existing = await this.roleRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException("Role name already in use by another role");
      }
    }
    return this.roleRepository.update(id, {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ?? undefined }
        : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.roleRepository.delete(id);
    return { success: true, id };
  }
}
`;

const controllerContent = `import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import { CreateRoleDto, UpdateRoleDto } from "@repo/shared/schemas/role.schema";
import { RoleService } from "./role.service";

@ApiTags("Roles")
@ApiBearerAuth("JWT-auth")
@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: "Get all roles with pagination and relationships" })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    
    const result = await this.roleService.findAll(pageNumber, limitNumber);
    return ResponseHelper.success(result.data, "Roles retrieved successfully", 200, result.meta);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get role by ID" })
  async findOne(@Param("id") id: string) {
    const role = await this.roleService.findOne(id);
    return ResponseHelper.success(role, "Role detail retrieved successfully");
  }

  @Post()
  @ApiOperation({ summary: "Create a new role" })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(createRoleDto);
    return ResponseHelper.success(role, "Role created successfully", 201);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing role" })
  async update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const role = await this.roleService.update(id, updateRoleDto);
    return ResponseHelper.success(role, "Role updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a role" })
  async remove(@Param("id") id: string) {
    const result = await this.roleService.remove(id);
    return ResponseHelper.success(result, "Role deleted successfully");
  }
}
`;

fs.writeFileSync(selectPath, selectContent);
fs.writeFileSync(repoPath, repoContent);
fs.writeFileSync(servicePath, serviceContent);
fs.writeFileSync(controllerPath, controllerContent);

console.log("Files successfully written to boilerplate");
