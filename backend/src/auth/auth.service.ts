import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

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
    const user = await this.usersService.findOne(username);

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: removedPassword, ...result } = user;
    void removedPassword;
    return result;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.userRight,
      company: user.companyCode,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.userRight,
        company: user.companyCode,
      },
    };
  }

  async validateToken(payload: any): Promise<User> {
    const user = await this.usersService.findOneById(payload.sub);
    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
