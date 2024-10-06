"use server";

import { isTableExist } from "@/lib/database";
import { Note } from "@/types/cornell";
import { sql } from "@vercel/postgres";

export async function getNotes({
  page = 0,
  pageNum = 20,
}: {
  page?: number;
  pageNum?: number;
}) {
  try {
    const { rows } = await sql`SELECT * FROM cornell LIMIT ${pageNum} OFFSET ${
      page * pageNum
    }`;
    return rows;
  } catch (error) {
    console.error(`Error fetching notes: ${error}`);
    return [];
  }
}

export async function insertNote({
  uid,
  title,
  link,
  icon_url,
  description,
  tags,
  screenshot,
  point,
  summary,
}: Note) {
  try {
    const exist = await isTableExist("cornell");
    if (!exist) {
      await sql`
        CREATE TABLE IF NOT EXISTS "cornell" (
          "id" SERIAL PRIMARY KEY NOT NULL,
          "uid" VARCHAR(255) NOT NULL,
          "title" VARCHAR(255) NOT NULL,
          "link" VARCHAR(255) NOT NULL,
          "icon_url" VARCHAR(255),
          "description" VARCHAR(255),
          "tags" VARCHAR(255),
          "screenshot" VARCHAR(255),
          "point" VARCHAR(255),
          "summary" VARCHAR(255)
        );
      `;
    }
    const tagsStr = tags?.join(",");
    await sql`
      INSERT INTO cornell (uid, title, link, icon_url, description, tags, screenshot, point, summary)
      VALUES (${uid}, ${title}, ${link}, ${icon_url}, ${description}, ${tagsStr}, ${screenshot}, ${point}, ${summary});
    `;
    return true;
  } catch (error) {
    console.error(`Error inserting note: ${error}`);
    return false;
  }
}

export async function deleteNote(uid: string) {
  try {
    await sql`
    DELETE FROM cornell WHERE uid = ${uid};
    `;
    return true;
  } catch (error) {
    console.error(`Error deleting note: ${error}`);
    return false;
  }
}

export async function updateNote({
  uid,
  title,
  link,
  icon_url,
  description,
  tags,
  screenshot,
  point,
  summary,
}: Note) {
  try {
    const tagsStr = tags?.join(",");
    await sql`
    UPDATE cornell
    SET title = ${title},
        link = ${link},
        icon_url = ${icon_url},
        description = ${description},
        tags = ${tagsStr},
        screenshot = ${screenshot},
        point = ${point},
        summary = ${summary}
    WHERE uid = ${uid};
    `;
    return true;
  } catch (error) {
    console.error(`Error updating note: ${error}`);
    return false;
  }
}
