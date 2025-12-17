# Task 02-01: Authentication Framework Setup

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 3
- **Priority**: High
- **Estimated Effort**: 2 days
- **Dependencies**: Task 01-02 (Database Setup)
- **Assignee**: Backend Developer

## Objective

Set up basic JWT-based authentication framework for the PoC. This includes user model, login endpoint, JWT token generation, and authentication guards.

## Requirements

### 1. User Model/Entity

#### User Table Schema
- `id` - Primary key (UUID or integer)
- `username` - Unique username
- `password` - Hashed password (bcrypt)
- `user_right` - User role (SUPERVISOR, REGULAR_USER)
- `company_code` - Company code (HT, BAT, INSP, HFW)
- `cre_date` - Creation date
- `mod_date` - Modification date
- `active` - Active status (boolean)

#### Reference: Original System
- **Table**: `muser` (from legacy system)
- **Roles**: SUPERVISOR, REGULAR_USER
- **Companies**: HT, BAT, INSP, HFW

### 2. Authentication Endpoints

#### POST /api/auth/login
- Accepts username and password
- Validates credentials
- Returns JWT token
- Returns user information (role, company)

#### POST /api/auth/logout (Optional)
- Invalidates token (if using token blacklist)

#### GET /api/auth/me
- Returns current user information
- Protected route (requires authentication)

### 3. JWT Configuration

#### Token Payload
- `sub` - User ID
- `username` - Username
- `role` - User role
- `company` - Company code

#### Token Expiration
- Access token: 1 day (for PoC)
- Refresh token: 7 days (if implementing)

### 4. Authentication Guards

#### JWT Auth Guard
- Validates JWT token
- Extracts user information
- Attaches user to request

#### Role Guard (Optional)
- Checks user role
- Allows/denies access based on role

## Implementation Steps

1. **Create User Entity/Model**
   - Define user schema
   - Create database migration
   - Run migration

2. **Implement Password Hashing**
   - Use bcrypt for password hashing
   - Implement hash/compare functions
   - Test password hashing

3. **Create Authentication Module**
   - Auth service
   - Auth controller
   - JWT strategy
   - JWT auth guard

4. **Implement Login Endpoint**
   - Validate credentials
   - Generate JWT token
   - Return token and user info

5. **Implement Auth Guards**
   - JWT auth guard
   - Apply to protected routes
   - Test authentication

6. **Create Seed Data**
   - Create test users
   - Default admin user
   - Test regular user

## Acceptance Criteria

- [ ] User entity/model created
- [ ] User table migration successful
- [ ] Password hashing working correctly
- [ ] Login endpoint functional
- [ ] JWT token generation working
- [ ] JWT token validation working
- [ ] Auth guards protecting routes
- [ ] /api/auth/me endpoint working
- [ ] Test users created
- [ ] Can login and receive token
- [ ] Protected routes require authentication

## API Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "username": "admin",
  "password": "password123",
  "company": "HT"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "SUPERVISOR",
    "company": "HT"
  }
}
```

### GET /api/auth/me
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "SUPERVISOR",
  "company": "HT"
}
```

## Testing Checklist

- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials fails
- [ ] JWT token generated correctly
- [ ] Protected route without token returns 401
- [ ] Protected route with valid token succeeds
- [ ] /api/auth/me returns current user
- [ ] Password hashing secure (bcrypt)

## Seed Data

```typescript
// Default admin user
{
  username: 'admin',
  password: 'hashed_password',
  user_right: 'SUPERVISOR',
  company_code: 'HT',
  active: true
}

// Test regular user
{
  username: 'user1',
  password: 'hashed_password',
  user_right: 'REGULAR_USER',
  company_code: 'HT',
  active: true
}
```

## Notes

- This is basic authentication for PoC
- OIDC will be implemented in MVP phase
- Store passwords securely (never plain text)
- Use environment variables for JWT secret
- Consider rate limiting for login endpoint

## Dependencies

- Task 01-02: Database Setup
- Task 03-01: Master Data Tables Schema (for user table)

## Next Tasks

- Task 02-02: API Foundation

## References

- **User Roles**: `../../../../docs/00-overview/user-roles.md`
- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`

