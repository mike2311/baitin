import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { User } from './entities/user.entity'

/**
 * Users Controller
 * 
 * Provides user-related endpoints.
 * 
 * Reference: Task 02-01 - Authentication Framework Setup
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      username: user.username,
      role: user.userRight,
      company: user.companyCode,
    }
  }
}


