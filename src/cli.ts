import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
import { query, listSchemas, listTables, describeTable, getApprovalStatus, healthCheck } from "./api-client.js";

function printTable(headers: string[], rows: string[][]) {
  const table = new Table({
    head: headers.map(h => chalk.bold(h)),
    style: { head: [], border: [] },
  });
  rows.forEach(row => table.push(row));
  console.log(table.toString());
}

const program = new Command();

program
  .name("hub-oracle")
  .description("Oracle DB client with governance, traceability, and security")
  .version("0.1.0");

program
  .command("query")
  .description("Execute a SQL query")
  .argument("<sql>", "SQL query to execute")
  .requiredOption("--schema <schema>", "Target schema (e.g., BHZ01_PRP)")
  .action(async (sql: string, opts) => {
    try {
      const result = await query(sql, opts.schema);

      switch (result.status) {
        case "success":
          if (result.rows && result.rows.length > 0) {
            const headers = Object.keys(result.rows[0]);
            const rows = result.rows.map((r: any) => headers.map(h => String(r[h] ?? "NULL")));
            printTable(headers, rows);
          }
          console.log(chalk.blue(`i ${result.rowsAffected ?? 0} rows affected in ${result.durationMs}ms`));
          break;
        case "pending_approval":
          console.log(chalk.yellow("! DELETE requires admin approval."));
          console.log(chalk.blue(`i Approval ID: ${result.approvalId}`));
          break;
        case "blocked":
          console.log(chalk.red(`x Blocked: ${result.error}`));
          break;
        case "error":
          console.log(chalk.red(`x Error: ${result.error}`));
          break;
      }
    } catch (err) {
      console.error(chalk.red(`x ${(err as Error).message}`));
    }
  });

program
  .command("status")
  .description("Check status of a pending DELETE approval")
  .argument("<id>", "Approval ID")
  .action(async (id: string) => {
    try {
      const approval = await getApprovalStatus(id);
      console.log(JSON.stringify(approval, null, 2));
    } catch (err) {
      console.error(chalk.red(`x ${(err as Error).message}`));
    }
  });

program
  .command("schemas")
  .description("List available Oracle schemas")
  .action(async () => {
    try {
      const result = await listSchemas();
      printTable(["Schema"], result.schemas.map((s: string) => [s]));
    } catch (err) {
      console.error(chalk.red(`x ${(err as Error).message}`));
    }
  });

program
  .command("tables")
  .description("List tables in a schema")
  .requiredOption("--schema <schema>", "Target schema")
  .action(async (opts) => {
    try {
      const result = await listTables(opts.schema);
      if (result.tables.length === 0) {
        console.log("No tables found.");
        return;
      }
      const headers = Object.keys(result.tables[0]);
      const rows = result.tables.map((t: any) => headers.map(h => String(t[h] ?? "NULL")));
      printTable(headers, rows);
    } catch (err) {
      console.error(chalk.red(`x ${(err as Error).message}`));
    }
  });

program
  .command("describe")
  .description("Describe columns of a table")
  .argument("<table>", "Table name")
  .requiredOption("--schema <schema>", "Target schema")
  .action(async (table: string, opts) => {
    try {
      const result = await describeTable(opts.schema, table);
      if (result.columns.length === 0) {
        console.log("Table not found.");
        return;
      }
      const headers = Object.keys(result.columns[0]);
      const rows = result.columns.map((c: any) => headers.map(h => String(c[h] ?? "NULL")));
      printTable(headers, rows);
    } catch (err) {
      console.error(chalk.red(`x ${(err as Error).message}`));
    }
  });

program
  .command("health")
  .description("Check API server health")
  .action(async () => {
    try {
      const result = await healthCheck();
      console.log(chalk.green(`+ API server is healthy (v${result.version})`));
    } catch (err) {
      console.error(chalk.red(`x API server unreachable: ${(err as Error).message}`));
    }
  });

program.parseAsync().catch(err => {
  console.error(err.message);
  process.exit(1);
});
