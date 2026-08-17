import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (client) return client;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta la variable DATABASE_URL. Copiá .env.example a .env.local y pegá la cadena de conexión de Neon."
    );
  }

  client = neon(connectionString);
  return client;
}

/**
 * Cliente SQL de Neon. Se usa como template tag:
 *   const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
 *
 * Los valores interpolados viajan siempre como parámetros ($1, $2, …),
 * así que no hay riesgo de inyección SQL.
 *
 * La conexión se crea de forma perezosa (con un Proxy) por dos motivos:
 * el proyecto compila aunque DATABASE_URL todavía no esté configurada, y
 * el Proxy reenvía también las propiedades del cliente —`query()`,
 * `transaction()`, `unsafe()`— que un simple envoltorio perdería.
 */
export const sql = new Proxy(
  // El destino sólo existe para que el Proxy sea invocable como función.
  function neonPlaceholder() {} as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args: unknown[]) {
      return (getClient() as unknown as (...a: unknown[]) => unknown)(...args);
    },
    get(_target, property) {
      const instance = getClient() as unknown as Record<
        string | symbol,
        unknown
      >;
      const value = instance[property];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  }
);
