import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpsertOrderConfirmationDto } from './dto/order-confirmation.dto';
import { OrderConfirmationService } from './services/order-confirmation.service';

@Controller('order-confirmation')
@UseGuards(JwtAuthGuard)
export class OrderConfirmationController {
  constructor(private readonly service: OrderConfirmationService) {}

  @Get('enquiry')
  async enquiry(
    @Query('confNo') confNo?: string,
    @Query('custNo') custNo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.enquiry({
      confNo,
      custNo,
      dateFrom,
      dateTo,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':confNo/report')
  async report(@Param('confNo') confNo: string) {
    return this.service.report(confNo);
  }

  @Get(':confNo')
  async get(@Param('confNo') confNo: string) {
    return this.service.get(confNo);
  }

  @Post()
  async upsert(
    @Body() dto: UpsertOrderConfirmationDto,
    @CurrentUser() user?: any,
  ) {
    return this.service.upsert(dto, user?.userId ?? user?.id ?? user?.username);
  }

  @Delete(':confNo')
  async remove(@Param('confNo') confNo: string) {
    return this.service.remove(confNo);
  }
}
