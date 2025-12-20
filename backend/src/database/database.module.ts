import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

/**
 * Database Module
 * 
 * Configures database connection and provides database services.
 * 
 * Reference: Task 01-02 - Database Setup
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'baitin_dev',
      password: process.env.DATABASE_PASSWORD || 'baitin_dev_password',
      database: process.env.DATABASE_NAME || 'baitin_poc_dev',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}


