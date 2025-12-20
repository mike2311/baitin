import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '../../users/entities/user.entity'

/**
 * Current User Decorator
 * 
 * Extracts the current authenticated user from the request.
 * 
 * Reference: Task 02-01 - Authentication Framework Setup
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)


