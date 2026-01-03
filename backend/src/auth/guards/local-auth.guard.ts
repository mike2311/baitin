import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Local Authentication Guard
 *
 * Used for login endpoint to validate username/password.
 *
 * Reference: Task 02-01 - Authentication Framework Setup
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
