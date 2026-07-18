import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    transform: postgres.camel,
    max: 5,
    idle_timeout: 20,
    max_lifetime: 60 * 5,
    connect_timeout: 10,
    fetch_types: false,
  });

globalForDb.sql = sql;
