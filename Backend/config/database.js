const path = require("path");

// Default: PostgreSQL. For SQLite set USE_SQLITE=1 (e.g. local dev).
const useSqlite = process.env.USE_SQLITE === "1";
const dbUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/inventory";

const config = useSqlite
  ? {
      dialect: "sqlite",
      storage: path.join(__dirname, "../database.sqlite"),
      logging: false,
    }
  : {
      dialect: "postgres",
      url: dbUrl,
      logging: false,
      dialectOptions:
        process.env.DATABASE_SSL !== "false" && dbUrl.indexOf("localhost") === -1
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    };

module.exports = config;
