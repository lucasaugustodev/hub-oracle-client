# Hub Oracle Client

CLI and MCP client for Oracle DB with governance, traceability, and security.

## Setup

```bash
npm install -g hub-oracle-client
```

Set your API key:

```bash
export HUB_ORACLE_API_KEY=hob_your_key_here
```

## CLI Usage

```bash
# List schemas
hub-oracle schemas

# List tables
hub-oracle tables --schema BHZ01_PRP

# Describe a table
hub-oracle describe TBL_PARAMETRO --schema BHZ01_PRP

# Execute a query
hub-oracle query "SELECT * FROM TBL_PARAMETRO WHERE ROWNUM <= 5" --schema BHZ01_PRP

# Check DELETE approval status
hub-oracle status <approval-id>

# Health check
hub-oracle health
```

## MCP Setup (Claude Code)

Add to your Claude Code settings:

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HUB_ORACLE_API_KEY` | Your API key (required) | - |
| `HUB_ORACLE_API_URL` | API server URL | `http://45.63.104.136:3100` |

## Security

- DDL operations (DROP, ALTER, CREATE, etc.) are permanently blocked
- DELETE requires admin approval before execution
- All queries are audited with before/after state capture
- API keys can be revoked at any time
