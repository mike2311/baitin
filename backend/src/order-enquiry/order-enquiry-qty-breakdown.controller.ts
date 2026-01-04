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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateOrderEnquiryQtyBreakdownDto,
  UpdateOrderEnquiryQtyBreakdownDto,
} from './dto/qty-breakdown.dto';
import { OrderEnquiryQtyBreakdownService } from './order-enquiry-qty-breakdown.service';

@Controller('order-enquiry/qty-breakdown')
@UseGuards(JwtAuthGuard)
export class OrderEnquiryQtyBreakdownController {
  constructor(private readonly service: OrderEnquiryQtyBreakdownService) {}

  @Get()
  async list(@Query('oeNo') oeNo: string, @Query('itemNo') itemNo?: string) {
    return this.service.list(oeNo, itemNo);
  }

  @Post()
  async create(
    @Body() dto: CreateOrderEnquiryQtyBreakdownDto,
    @CurrentUser() user?: any,
  ) {
    return this.service.create(dto, user?.userId ?? user?.id ?? user?.username);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderEnquiryQtyBreakdownDto,
    @CurrentUser() user?: any,
  ) {
    return this.service.update(
      id,
      dto,
      user?.userId ?? user?.id ?? user?.username,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
