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
import { UpsertContractDto } from './dto/contract.dto';
import { ContractService } from './services/contract.service';

@Controller('contract')
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @Get('enquiry')
  async enquiry(
    @Query('contNo') contNo?: string,
    @Query('confNo') confNo?: string,
    @Query('vendorNo') vendorNo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.enquiry({
      contNo,
      confNo,
      vendorNo,
      dateFrom,
      dateTo,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':contNo/report')
  async report(@Param('contNo') contNo: string) {
    return this.service.report(contNo);
  }

  @Get(':contNo')
  async get(@Param('contNo') contNo: string) {
    return this.service.get(contNo);
  }

  @Post()
  async upsert(@Body() dto: UpsertContractDto, @CurrentUser() user?: any) {
    return this.service.upsert(dto, user?.userId ?? user?.id ?? user?.username);
  }

  @Delete(':contNo')
  async remove(@Param('contNo') contNo: string) {
    return this.service.remove(contNo);
  }
}
