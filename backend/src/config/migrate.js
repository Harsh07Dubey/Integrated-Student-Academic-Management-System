const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const pool = require("./db");

async function migrate() {
  const sql = ["base.sql", "library.sql", "academics.sql"]
    .map((file) => readFileSync(join(__dirname, file), "utf8"))
    .join("\n");
  try {
    await pool.query("BEGIN;\n" + sql + "\nCOMMIT;");
    console.log("Database schema is ready.");
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
