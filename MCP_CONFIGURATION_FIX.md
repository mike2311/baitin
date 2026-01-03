# MCP Configuration Fix Required

## Problem

The MCP baitin server is currently connected to the **WRONG** Supabase project:
- ❌ Currently connected to: `https://gfsnbwvhqwxvesmmajjh.supabase.co`
- ✅ Should be connected to: `https://tvntlxdninziiievjgzx.supabase.co`

## Solution

### Update Cursor MCP Configuration

1. Open Cursor Settings (Ctrl+, or Cmd+,)
2. Find MCP Servers configuration (usually in settings JSON)
3. Update the configuration to:

```json
{
  "mcpServers": {
    "baitin": {
      "url": "https://mcp.supabase.com/mcp?project_ref=tvntlxdninziiievjgzx"
    }
  }
}
```

**Important**: The server name must be `"baitin"` (not `"supabase"`) so that all `mcp_baitin_*` functions connect to the correct project.

### After Updating

1. **Restart Cursor** completely for the changes to take effect
2. Verify the connection by checking the project URL
3. Then we'll need to recreate the tables in the correct database:
   - `users` table (with admin user)
   - `zstdcode` table (27 rows)
   - `zorigin` table (4 rows)

## Current Data Status

The tables currently exist in the **wrong project** (gfsnbwvhqwxvesmmajjh):
- `users`: 1 row (admin user)
- `zstdcode`: 27 rows
- `zorigin`: 4 rows

These will need to be recreated in the **correct project** (tvntlxdninziiievjgzx) after the MCP configuration is fixed.

## Backend .env Configuration

The backend `.env` is already correctly configured:
```
DATABASE_HOST=db.tvntlxdninziiievjgzx.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=Jujruddo1
DATABASE_NAME=postgres
```

Once the MCP configuration is fixed, we can verify and recreate the tables in the correct database.

