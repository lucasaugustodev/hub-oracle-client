# Hub Oracle Client

CLI and MCP client for Hub Oracle — Oracle DB governance with traceability, security, and module-based access control.

## Setup

```bash
npm install -g hub-oracle-client
```

Set your API key (provided by your admin):

```bash
export HUB_ORACLE_API_KEY=hob_your_key_here
```

## CLI Usage

```bash
# Check API connection
hub-oracle health

# List available schemas
hub-oracle schemas

# List tables in a schema
hub-oracle tables --schema BHZ01_PRP

# Describe table columns
hub-oracle describe TBL_CLIENTES_CBR --schema BHZ01_PRP

# Execute a SELECT query
hub-oracle query "SELECT * FROM TBL_CLIENTES_CBR WHERE ROWNUM <= 10" --schema BHZ01_PRP

# Execute an INSERT/UPDATE (requires write-level key)
hub-oracle query "UPDATE TBL_PARAMETRO SET VALOR = 'new' WHERE ID_PARAMETRO = 1" --schema BHZ01_PRP

# DELETE goes to admin approval queue
hub-oracle query "DELETE FROM TBL_PARAMETRO WHERE ID_PARAMETRO = 99999" --schema BHZ01_PRP

# Check DELETE approval status
hub-oracle status <approval-id>
```

## MCP Setup (Claude Code / AI Integration)

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "hub-oracle": {
      "command": "npx",
      "args": ["hub-oracle-client"],
      "env": {
        "HUB_ORACLE_API_KEY": "hob_your_key_here"
      }
    }
  }
}
```

### MCP Tools Available

| Tool | Description |
|------|-------------|
| `oracle_query` | Execute SQL (SELECT, INSERT, UPDATE, DELETE) |
| `oracle_delete_status` | Check pending DELETE approval status |
| `oracle_list_schemas` | List available Oracle schemas |
| `oracle_list_tables` | List tables in a schema |
| `oracle_describe_table` | Describe table columns and types |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HUB_ORACLE_API_KEY` | Your API key (required) | - |
| `HUB_ORACLE_API_URL` | API server URL | `https://db.somosahub.us` |

## Security Model

### Permission Levels

Your API key has a permission level assigned by the admin:

| Level | SELECT | INSERT | UPDATE | DELETE | DDL |
|-------|--------|--------|--------|--------|-----|
| **read** | yes | no | no | no | NEVER |
| **write** | yes | yes | yes | requires approval | NEVER |

### Table Access Control

Your key may be restricted to specific table modules (e.g., clientes, faturamento, contratos). If you try to access a table outside your modules, you'll get:

```
x Blocked: Access denied to table TBL_FATURAMENTO_D
```

Contact your admin to request access to additional modules.

### What's Always Blocked

- **DDL operations**: DROP, ALTER, CREATE, TRUNCATE, GRANT, REVOKE — permanently blocked, no exceptions
- **Multi-statement queries**: `SELECT 1; DROP TABLE x` — blocked at parser level
- **SQL injection attempts**: comment-based bypass, case mixing, encoding tricks — detected and blocked

### Audit Trail

Every query you execute is logged with: your key identity, the SQL, schema, timestamp, duration, and for writes, the before/after state of affected rows. Your admin can review all activity.
