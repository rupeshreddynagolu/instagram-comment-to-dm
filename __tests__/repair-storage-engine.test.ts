/**
 * Storage engine repair — Unit Tests
 *
 * Hosts whose MySQL defaults to MyISAM create every table without
 * transactions, row locks or foreign keys. The repair converts those tables
 * to InnoDB and adds back the foreign keys the migrations declared.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  parseForeignKeyStatements,
  repairStorageEngine,
} from "../lib/db/repair-storage-engine";

const ACCOUNT_FK =
  "ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;";
const SESSION_FK =
  "ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "repair-engine-"));
  fs.mkdirSync(path.join(dir, "20260101000000_baseline"));
  fs.writeFileSync(
    path.join(dir, "20260101000000_baseline", "migration.sql"),
    `CREATE TABLE \`Account\` (\`id\` VARCHAR(191) NOT NULL);\n\n-- AddForeignKey\n${ACCOUNT_FK}\n\n-- AddForeignKey\n${SESSION_FK}\n`
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function fakeConnection({
  tables,
  constraints,
  failOn,
}: {
  tables: { TABLE_NAME: string; ENGINE: string }[];
  constraints: string[];
  failOn?: string;
}) {
  const executed: string[] = [];
  const conn = {
    query: vi.fn(async (sql: string) => {
      if (sql.includes("information_schema.TABLES")) return tables;
      if (sql.includes("information_schema.REFERENTIAL_CONSTRAINTS")) {
        return constraints.map((CONSTRAINT_NAME) => ({ CONSTRAINT_NAME }));
      }
      if (failOn && sql.includes(failOn)) {
        throw new Error("Cannot add or update a child row");
      }
      executed.push(sql);
      return [];
    }),
  };
  return { conn, executed };
}

describe("parseForeignKeyStatements", () => {
  it("finds every ADD CONSTRAINT ... FOREIGN KEY statement", () => {
    const sql = fs.readFileSync(
      path.join(dir, "20260101000000_baseline", "migration.sql"),
      "utf8"
    );

    expect(parseForeignKeyStatements(sql)).toEqual([
      { table: "Account", name: "Account_userId_fkey", statement: ACCOUNT_FK },
      { table: "Session", name: "Session_userId_fkey", statement: SESSION_FK },
    ]);
  });
});

describe("repairStorageEngine", () => {
  it("converts MyISAM tables to InnoDB", async () => {
    const { conn, executed } = fakeConnection({
      tables: [
        { TABLE_NAME: "Automation", ENGINE: "MyISAM" },
        { TABLE_NAME: "sidequest_jobs", ENGINE: "MyISAM" },
        { TABLE_NAME: "User", ENGINE: "InnoDB" },
      ],
      constraints: ["Account_userId_fkey", "Session_userId_fkey"],
    });

    const result = await repairStorageEngine(conn, dir);

    expect(executed).toEqual([
      "ALTER TABLE `Automation` ENGINE=InnoDB",
      "ALTER TABLE `sidequest_jobs` ENGINE=InnoDB",
    ]);
    expect(result.converted).toEqual(["Automation", "sidequest_jobs"]);
  });

  it("adds only the foreign keys that are missing", async () => {
    const { conn, executed } = fakeConnection({
      tables: [{ TABLE_NAME: "Account", ENGINE: "InnoDB" }],
      constraints: ["Account_userId_fkey"],
    });

    const result = await repairStorageEngine(conn, dir);

    expect(executed).toEqual([SESSION_FK]);
    expect(result.foreignKeysAdded).toEqual(["Session_userId_fkey"]);
  });

  it("does nothing on a healthy InnoDB database", async () => {
    const { conn, executed } = fakeConnection({
      tables: [{ TABLE_NAME: "Account", ENGINE: "InnoDB" }],
      constraints: ["Account_userId_fkey", "Session_userId_fkey"],
    });

    const result = await repairStorageEngine(conn, dir);

    expect(executed).toEqual([]);
    expect(result).toEqual({ converted: [], foreignKeysAdded: [] });
  });

  it("logs and skips a foreign key that cannot be added", async () => {
    const { conn } = fakeConnection({
      tables: [],
      constraints: [],
      failOn: "Account_userId_fkey",
    });

    const result = await repairStorageEngine(conn, dir);

    expect(result.foreignKeysAdded).toEqual(["Session_userId_fkey"]);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[Migrate] Could not add foreign key Account_userId_fkey"),
      expect.any(String)
    );
  });
});
