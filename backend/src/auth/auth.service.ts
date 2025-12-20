import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { User } from '../users/entities/user.entity'

/**
 * Authentication Service
 * 
 * Handles user authentication, password validation, and JWT token generation.
 * 
 * Original Logic Reference:
 * - Documentation: docs/00-overview/user-roles.md
 * - Business Rule: Users must have valid username, password, and company code
 * 
 * Reference: Task 02-01 - Authentication Framework Setup
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username)
    console.log('[AuthService] User lookup:', { username, found: !!user, active: user?.active })
    
    if (!user || !user.active) {
      console.log('[AuthService] User not found or inactive')
      throw new UnauthorizedException('Invalid credentials')
    }

    console.log('[AuthService] Comparing password, stored hash length:', user.password?.length)
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('[AuthService] Password comparison result:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('[AuthService] Password validation failed')
      throw new UnauthorizedException('Invalid credentials')
    }

    const { password: _, ...result } = user
    return result
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.userRight,
      company: user.companyCode,
    }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.userRight,
        company: user.companyCode,
      },
    }
  }

  async validateToken(payload: any): Promise<User> {
    const user = await this.usersService.findOneById(payload.sub)
    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive')
    }
    return user
  }
}


