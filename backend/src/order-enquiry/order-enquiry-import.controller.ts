import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ImportOrderEnquiryDto } from './dto/import-order-enquiry.dto';
import { OrderEnquiryImportService } from './order-enquiry-import.service';

@Controller('order-enquiry')
export class OrderEnquiryImportController {
  constructor(private readonly importService: OrderEnquiryImportService) {}

  /**
   * Import Order Enquiry lines from a file (CSV/XLS/XLSX) into OE tables.
   *
   * Original Logic Reference:
   * - Documentation: docs/source/03-application-modules/order-enquiry-module.md (Excel Import formats)
   * - Documentation: docs/source/02-business-processes/order-enquiry-process.md (OE Control validation + INSP exception)
   */
  @UseGuards(JwtAuthGuard)
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @Body() dto: ImportOrderEnquiryDto,
    @UploadedFile() file?: Express.Multer.File,
    @CurrentUser() user?: any,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('file is required');
    }

    return this.importService.importFile(
      dto,
      { originalName: file.originalname, buffer: file.buffer },
      user?.userId ?? user?.id ?? user?.username,
    );
  }
}
