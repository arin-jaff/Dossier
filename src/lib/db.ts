import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    transform: postgres.camel,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

globalForDb.sql = sql;
