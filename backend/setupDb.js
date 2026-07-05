const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Connect without database first to create the database if not exists
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true, // Allow multiple statements in one query
});

connection.connect((err) => {
  if (err) {
    console.error("Koneksi MySQL gagal:", err.message);
    process.exit(1);
  }
  console.log("MySQL terhubung. Menjalankan skema database...");

  const schemaPath = path.join(__dirname, "../database/eventhub.sql/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  // Run the entire SQL file at once! multipleStatements is true, so we can just execute the whole file.
  connection.query(schemaSql, (err, results) => {
    if (err) {
      console.error("Gagal menjalankan skema database:", err.message);
      connection.end();
      process.exit(1);
    }
    console.log("✅ Skema database berhasil di-setup!");
    connection.end();
    process.exit(0);
  });
});
