# Task 02-02: API Foundation (NestJS)

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 3
- **Priority**: High
- **Estimated Effort**: 3 days
- **Dependencies**: Task 01-02 (Database Setup), Task 02-01 (Authentication)
- **Assignee**: Backend Developer

## Objective

Set up NestJS API foundation with proper structure, modules, error handling, validation, logging, and API documentation.

## Requirements

### 1. NestJS Project Structure

#### Module Structure
```
src/
├── main.ts
├── app.module.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   └── auth.service.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   └── configuration.ts
└── database/
    └── database.module.ts
```

### 2. Core Configuration

#### Environment Configuration
- Environment variable management
- Configuration module
- Type-safe configuration

#### Global Exception Filter
- Standardized error responses
- Error logging
- Development vs production error handling

#### Validation Pipe
- Global validation pipe
- Class-validator integration
- Custom validation messages

#### Logging
- Logger configuration
- Request logging
- Error logging
- Performance logging

### 3. API Documentation

#### Swagger/OpenAPI
- Swagger setup
- API documentation generation
- Endpoint documentation

### 4. Common Utilities

#### Response DTOs
- Standardized response format
- Error response format
- Success response format

#### Decorators
- Current user decorator
- Roles decorator
- Public route decorator

#### Interceptors
- Response transformation
- Logging interceptor
- Performance monitoring

## Implementation Steps

1. **Set Up NestJS Project**
   - Initialize NestJS project
   - Configure TypeScript
   - Set up module structure

2. **Configure Environment**
   - Install @nestjs/config
   - Set up configuration module
   - Load environment variables

3. **Set Up Global Pipes/Filters**
   - Global validation pipe
   - Global exception filter
   - Request logging interceptor

4. **Set Up Swagger**
   - Install @nestjs/swagger
   - Configure Swagger module
   - Add API documentation

5. **Create Common Modules**
   - Common decorators
   - Common DTOs
   - Common utilities

6. **Set Up Database Module**
   - Database connection
   - Repository pattern
   - Transaction support

7. **Create Health Check**
   - Health check endpoint
   - Database health check
   - Service health check

## Acceptance Criteria

- [ ] NestJS project initialized
- [ ] Module structure set up correctly
- [ ] Environment configuration working
- [ ] Global validation pipe working
- [ ] Global exception filter working
- [ ] Swagger documentation accessible
- [ ] Logging configured and working
- [ ] Health check endpoint working
- [ ] Database module integrated
- [ ] Authentication integrated
- [ ] API can start and run

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [ ... ]
  },
  "timestamp": "2025-01-XX..."
}
```

## Swagger Configuration

```typescript
const config = new DocumentBuilder()
  .setTitle('BAITIN PoC API')
  .setDescription('API documentation for BAITIN PoC')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

## Health Check Endpoint

### GET /health
**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-01-XX..."
}
```

## Testing Checklist

- [ ] API starts successfully
- [ ] Health check returns success
- [ ] Swagger UI accessible
- [ ] Validation works on endpoints
- [ ] Error handling returns proper format
- [ ] Logging captures requests
- [ ] Authentication guards work

## Notes

- Follow NestJS best practices
- Use dependency injection properly
- Keep modules focused and modular
- Document all endpoints with Swagger
- Use DTOs for all request/response

## Dependencies

- Task 01-02: Database Setup
- Task 02-01: Authentication Setup

## Next Tasks

- Task 02-03: Frontend Foundation

## References

- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`
- **Target Architecture**: `../../../../docs/modernization-strategy/03-target-state-architecture/`

