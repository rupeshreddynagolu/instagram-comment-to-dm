/**
 * Repairs tables created on hosts whose MySQL defaults to MyISAM.
 *
 * Shared cPanel servers often set default_storage_engine=MyISAM, so a CREATE
 * TABLE without an ENGINE clause (every Prisma migration, every Sidequest
 * table) lands on MyISAM. MyISAM has no transactions or row locks, which the
 * DM queue and rate limiter depend on, and it silently ignores foreign keys,
 * so cascading deletes never happen.
 *
 * Runs at startup after the migrations: converts every MyISAM table in the
 * current database to InnoDB, then adds each foreign key the migrations
 * declared that the database does not have. On a healthy database it only
 * reads information_schema.
 */

import fs from "node:fs";
import path from "node:path";

export interface RepairConnection {
  query(sql: string, values?: unknown[]): Promise<unknown>;
}

export interface RepairResult {
  converted: string[];
  foreignKeysAdded: string[];
}

export interface ForeignKeyStatement {
  table: string;
  name: string;
  statement: string;
}

const FOREIGN_KEY_STATEMENT =
  /^ALTER TABLE `([^`]+)` ADD CONSTRAINT `([^`]+)` FOREIGN KEY .*;$/gm;

export function parseForeignKeyStatements(sql: string): ForeignKeyStatement[] {
  return [...sql.matchAll(FOREIGN_KEY_STATEMENT)].map((match) => ({
    table: match[1],
    name: match[2],
    statement: match[0],
  }));
}

function readForeignKeyStatements(migrationsDir: string) {
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .flatMap((name) =>
      parseForeignKeyStatements(
        fs.readFileSync(path.join(migrationsDir, name, "migration.sql"), "utf8")
      )
    );
}

export async function repairStorageEngine(
  conn: RepairConnection,
  migrationsDir: string
): Promise<RepairResult> {
  const tables = (await conn.query(
    "SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'"
  )) as { TABLE_NAME: string; ENGINE: string | null }[];

  const converted: string[] = [];
  for (const table of tables) {
    if (table.ENGINE !== "MyISAM") continue;
    await conn.query(`ALTER TABLE \`${table.TABLE_NAME}\` ENGINE=InnoDB`);
    converted.push(table.TABLE_NAME);
  }

  const existing = (await conn.query(
    "SELECT CONSTRAINT_NAME FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE()"
  )) as { CONSTRAINT_NAME: string }[];
  const present = new Set(existing.map((row) => row.CONSTRAINT_NAME));

  const foreignKeysAdded: string[] = [];
  for (const foreignKey of readForeignKeyStatements(migrationsDir)) {
    if (present.has(foreignKey.name)) continue;
    try {
      await conn.query(foreignKey.statement);
      foreignKeysAdded.push(foreignKey.name);
    } catch (error) {
      // Usually orphan rows left behind while the table had no constraint.
      // The app works without the key; report it and carry on.
      console.error(
        `[Migrate] Could not add foreign key ${foreignKey.name}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  return { converted, foreignKeysAdded };
}
