import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BomManagementService } from './bom.service';
import {
  CreateProductBomDto,
  UpdateProductBomDto,
} from './dto/product-bom.dto';

@Controller('bom')
@UseGuards(JwtAuthGuard)
export class BomController {
  constructor(private readonly service: BomManagementService) {}

  @Get()
  async list(@Query('itemNo') itemNo: string) {
    return this.service.list(itemNo);
  }

  @Post()
  async create(@Body() dto: CreateProductBomDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductBomDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
