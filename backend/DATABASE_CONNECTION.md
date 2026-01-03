# Database Connection Configuration

## Supabase PostgreSQL Database

**CRITICAL**: Always use the **MCP baitin** server for all Supabase PostgreSQL operations.

### Connection Details

- **Connection String**: `postgresql://postgres:Jujruddo1@db.tvntlxdninziiievjgzx.supabase.co:5432/postgres`
- **Host**: `db.tvntlxdninziiievjgzx.supabase.co`
- **Port**: `5432`
- **Database**: `postgres` (Supabase default database)
- **User**: `postgres`
- **Password**: `Jujruddo1`
- **Project Ref**: `tvntlxdninziiievjgzx`

### Backend .env Configuration

The `backend/.env` file should contain:

```env
DATABASE_HOST=db.tvntlxdninziiievjgzx.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=Jujruddo1
DATABASE_NAME=postgres
```

### MCP Server Usage

**For Database Operations, ALWAYS use MCP baitin functions**:
- ✅ `mcp_baitin_execute_sql` - Execute SQL queries
- ✅ `mcp_baitin_apply_migration` - Apply database migrations
- ✅ `mcp_baitin_list_tables` - List database tables
- ✅ `mcp_baitin_get_project_url` - Get project URL
- ✅ All other `mcp_baitin_*` functions

**DO NOT use**:
- ❌ `mcp_supabase_*` functions
- ❌ `mcp_crystal_*` functions

### Current Database State

**BAITIN Application Tables**:
- `users` - User authentication (1 admin user: admin/password123)
- `zstdcode` - Standard codes reference (27 rows - migrated from legacy DBF)
- `zorigin` - Origin codes reference (4 rows - migrated from legacy DBF)

**Note**: Other tables in the database (e.g., Stakeholder, organizations, etc.) are from other projects and should not be modified.

### Migration CLI Configuration

When using the migration CLI tool, ensure environment variables point to this database:
- `DB_HOST=db.tvntlxdninziiievjgzx.supabase.co`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=Jujruddo1`
- `DB_NAME=postgres`

### Verification

To verify the connection is working:

```sql
SELECT current_database(), current_user;
SELECT COUNT(*) FROM users WHERE username = 'admin';
SELECT COUNT(*) FROM zstdcode;
SELECT COUNT(*) FROM zorigin;
```

All queries should return expected results when using MCP baitin functions.

