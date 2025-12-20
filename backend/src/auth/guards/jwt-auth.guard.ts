import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * JWT Authentication Guard
 * 
 * Protects routes that require JWT authentication.
 * 
 * Reference: Task 02-01 - Authentication Framework Setup
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}


