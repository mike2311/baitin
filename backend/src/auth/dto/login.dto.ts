import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * Login DTO
 *
 * Request DTO for login endpoint.
 *
 * Reference: Task 02-01 - Authentication Framework Setup
 */
export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'HT', required: false })
  @IsString()
  @IsOptional()
  company?: string;
}
