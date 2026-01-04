import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GenerateContractFromOcDto } from './dto/generate-contract.dto';
import { ContractGenerationService } from './services/contract-generation.service';

@Controller('contract')
@UseGuards(JwtAuthGuard)
export class ContractGenerationController {
  constructor(private readonly service: ContractGenerationService) {}

  /**
   * Generate contract(s) from an Order Confirmation (OC), grouped by vendor.
   *
   * Original Logic Reference:
   * - Documentation: docs/source/02-business-processes/contract-process.md (vendor grouping + BOM propagation)
   * - Business Rule: One contract per vendor per OC (group by vendor_no)
   */
  @Post('generate')
  async generate(
    @Body() dto: GenerateContractFromOcDto,
    @CurrentUser() user?: any,
  ) {
    return this.service.generateFromOc(
      dto.confNo,
      user?.userId ?? user?.id ?? user?.username,
    );
  }
}
