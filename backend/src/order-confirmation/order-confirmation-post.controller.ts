import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PostOeToOcDto } from './dto/post-oe-to-oc.dto';
import { PostOeToOcService } from './services/post-oe-to-oc.service';

@Controller('order-confirmation')
@UseGuards(JwtAuthGuard)
export class OrderConfirmationPostController {
  constructor(private readonly service: PostOeToOcService) {}

  /**
   * Post one or more OEs to Order Confirmations (OC).
   *
   * Original Logic Reference:
   * - FoxPro Form: `upostoe` (Post OE/Post OC)
   * - Documentation: docs/source/04-forms-and-screens/order-confirmation-forms.md (umordhd/umorddt)
   */
  @Post('post')
  async post(@Body() dto: PostOeToOcDto, @CurrentUser() user?: any) {
    return this.service.post(dto, user?.userId ?? user?.id ?? user?.username);
  }
}
