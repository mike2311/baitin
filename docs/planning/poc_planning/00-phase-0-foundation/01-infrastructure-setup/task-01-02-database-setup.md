# Task 01-02: Database Setup and Configuration

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 1
- **Priority**: Critical
- **Estimated Effort**: 2 days
- **Dependencies**: Task 01-01 (Development Environment)
- **Assignee**: Backend Developer

## Objective

Set up PostgreSQL database for PoC with proper configuration, connection management, and basic schema structure. This includes creating the database, setting up connection pooling, and preparing for schema migrations.

## Requirements

### 1. Database Creation

#### Development Database
- Database name: `baitin_poc_dev`
- Database user: `baitin_dev` (or configured user)
- Permissions: Full access to development database
- Encoding: UTF-8

#### Test Database (Optional)
- Database name: `baitin_poc_test`
- For running integration tests

### 2. Connection Configuration

#### Connection Pooling
- Configure connection pool size
- Set appropriate timeouts
- Configure retry logic

#### Environment-Based Configuration
- Development database connection
- Test database connection
- Production database connection (for future)

### 3. Migration Setup

#### Migration Tool
- TypeORM migrations (if using TypeORM)
- Or Prisma migrations (if using Prisma)
- Or raw SQL migrations with version control

#### Migration Structure
- Initial migration template
- Migration versioning
- Rollback capability

### 4. Database Tools Integration

#### ORM Setup
- TypeORM or Prisma configured
- Database schema defined in code
- Type-safe database access

#### Seeding Setup
- Seed script for reference data
- Development data seeding (optional)
- Test data seeding

## Implementation Steps

1. **Create Database**
   - Create development database
   - Create database user
   - Grant appropriate permissions
   - Verify creation

2. **Configure Connection**
   - Set up connection configuration
   - Configure connection pooling
   - Add connection health check
   - Test connection

3. **Set Up ORM/Migration Tool**
   - Install and configure TypeORM or Prisma
   - Create initial migration structure
   - Set up migration scripts
   - Test migration execution

4. **Create Database Module (NestJS)**
   - Database module setup
   - Connection provider
   - Repository pattern setup
   - Database health check endpoint

5. **Configure Environment Variables**
   - Database connection string
   - Connection pool settings
   - Migration settings

6. **Documentation**
   - Connection string format
   - Migration commands
   - Seeding commands
   - Backup/restore procedures

## Acceptance Criteria

- [ ] Development database created and accessible
- [ ] Database connection successful from backend
- [ ] Connection pooling configured correctly
- [ ] Migration tool set up and working
- [ ] Can run migrations successfully
- [ ] Can rollback migrations
- [ ] Database health check endpoint working
- [ ] Environment variables configured
- [ ] Documentation created

## Database Configuration

### Connection Pool Settings
```typescript
{
  max: 20, // Maximum pool size
  min: 5,  // Minimum pool size
  idle: 10000, // Idle timeout
  acquire: 30000, // Acquire timeout
  evict: 1000 // Eviction interval
}
```

### TypeORM Configuration Example
```typescript
{
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false, // Never true in production
  logging: process.env.NODE_ENV === 'development',
}
```

## Testing Checklist

- [ ] Connection test successful
- [ ] Migration execution works
- [ ] Migration rollback works
- [ ] Connection pooling working correctly
- [ ] Health check endpoint returns success
- [ ] Database errors handled gracefully

## Environment Variables

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=baitin_poc_dev
DATABASE_USER=baitin_dev
DATABASE_PASSWORD=your_password
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
```

## Notes

- Use environment variables for all connection settings
- Never hardcode credentials
- Set up connection retry logic
- Monitor connection pool usage
- Consider using connection string format for easier configuration

## Dependencies

- Task 01-01: Development Environment Setup

## Next Tasks

- [Task 03-01](../03-database-schema/task-03-01-master-data-tables.md): Master Data Tables Schema

## References

- **Data Architecture**: `../../../../docs/01-data-architecture/table-details/master-data-tables.md`
- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`

