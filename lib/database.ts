import { sql } from "@vercel/postgres";

export const dbName = "capybara-postgres";

export async function isTableExist(tableName: string) {
  const { rows } = await sql`
  SELECT COUNT(*) 
  FROM information_schema.tables 
  WHERE table_schema = ${dbName} AND table_name = ${tableName};
  `;
  return parseInt(rows[0].count, 10) > 0;
}
