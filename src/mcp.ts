import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { query, listSchemas, listTables, describeTable, getApprovalStatus } from "./api-client.js";

const server = new McpServer({
  name: "hub-oracle-mcp",
  version: "0.1.0",
});

server.tool(
  "oracle_query",
  "Execute a SQL query on the Oracle database. SELECT queries run directly. INSERT/UPDATE are executed with before/after diff capture. DELETE requires admin approval. DDL is permanently blocked.",
  { sql: z.string().describe("SQL query"), schema: z.string().describe("Oracle schema (e.g., BHZ01_PRP)") },
  async (args) => {
    try {
      const result = await query(args.sql, args.schema);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: (err as Error).message }) }] };
    }
  }
);

server.tool(
  "oracle_delete_status",
  "Check the status of a pending DELETE approval request.",
  { approval_id: z.string().describe("Approval ID") },
  async (args) => {
    try {
      const result = await getApprovalStatus(args.approval_id);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: (err as Error).message }) }] };
    }
  }
);

server.tool(
  "oracle_list_schemas",
  "List available Oracle schemas.",
  {},
  async () => {
    try {
      const result = await listSchemas();
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: (err as Error).message }) }] };
    }
  }
);

server.tool(
  "oracle_list_tables",
  "List all tables in an Oracle schema.",
  { schema: z.string().describe("Oracle schema name") },
  async (args) => {
    try {
      const result = await listTables(args.schema);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: (err as Error).message }) }] };
    }
  }
);

server.tool(
  "oracle_describe_table",
  "Describe columns, data types and constraints of an Oracle table.",
  { table_name: z.string().describe("Table name"), schema: z.string().describe("Oracle schema") },
  async (args) => {
    try {
      const result = await describeTable(args.schema, args.table_name);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: (err as Error).message }) }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error("MCP server failed:", err);
  process.exit(1);
});
