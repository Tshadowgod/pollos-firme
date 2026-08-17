/**
 * Crea las tablas en Neon a partir de db/schema.sql.
 *
 *   npm run db:setup
 *
 * Es idempotente: se puede correr las veces que haga falta.
 */
import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "\n❌ Falta DATABASE_URL.\n" +
      "   Copiá .env.example a .env.local y pegá la cadena de conexión de Neon.\n"
  );
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "..", "db", "schema.sql");

const sql = neon(connectionString);

console.log("🔌 Conectando a Neon…");
const schema = await readFile(schemaPath, "utf8");

// Neon HTTP no acepta varios statements en una sola llamada, así que
// separamos el archivo respetando los bloques DO $$ … $$.
const statements = splitStatements(schema);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`✅ Esquema aplicado (${statements.length} sentencias).`);
console.log("👉 Ahora cargá el menú de ejemplo con: npm run db:seed\n");

function splitStatements(source: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollarBlock = false;

  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--") || trimmed === "") {
      if (!inDollarBlock) continue;
    }

    // Un bloque DO $$ … $$ contiene ";" que no terminan la sentencia.
    const dollarMarkers = (line.match(/\$\$/g) ?? []).length;
    if (dollarMarkers % 2 === 1) inDollarBlock = !inDollarBlock;

    current += line + "\n";

    if (!inDollarBlock && trimmed.endsWith(";")) {
      statements.push(current.trim());
      current = "";
    }
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}
