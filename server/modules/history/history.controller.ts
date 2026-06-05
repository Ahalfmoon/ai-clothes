import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { HistoryService } from "./history.service";
import type { CreateHistoryRequest } from "@shared/api.interface";

@Controller("api/history")
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  async create(@Body() dto: CreateHistoryRequest): Promise<{ id: string }> {
    // Mock userId - 部署到 Vercel 后需要从认证中获取
    const userId = "mock-user-id";
    return this.historyService.create(userId, dto);
  }

  @Get()
  async getList(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string
  ) {
    // Mock userId
    const userId = "mock-user-id";
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    return this.historyService.getList(userId, pageNum, pageSizeNum);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    // Mock userId
    const userId = "mock-user-id";
    return this.historyService.delete(userId, id);
  }
}
