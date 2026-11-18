const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "false" ? false : undefined
});

pool.on("connect", () => {
    console.log("Connected to PostgreSQL");
});

pool.on("error", (err) => {
    console.error("Database error:", err);
});

module.exports = pool;
