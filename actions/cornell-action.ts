"use server";

import { cloudinary } from "@/lib/cloudinary";
import { isTableExist } from "@/lib/database";
import { Note } from "@/types/cornell";
import { sql } from "@vercel/postgres";

export async function getNotes({
  page = 0,
  pageNum = 20,
  limit = false,
}: {
  page?: number;
  pageNum?: number;
  limit?: boolean;
}) {
  try {
    if (!limit) {
      const { rows } = await sql`SELECT * FROM cornell ORDER BY id ASC`;
      return rows;
    } else {
      const { rows } =
        await sql`SELECT * FROM cornell ORDER BY id ASC LIMIT ${pageNum} OFFSET ${
          page * pageNum
        }`;
      return rows;
    }
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
    await cloudinary.uploader.destroy(`cornell/${uid}`, {
      resource_type: "image",
      type: "upload",
    });
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

export async function deleteTag(notes: Note[], tag: string) {
  try {
    const targetNotes = notes
      .filter((note) => note.tags?.includes(tag))
      .map((note) => {
        note.tags = note.tags?.filter((t) => t !== tag);
        return note;
      });
    const result = await Promise.all(
      targetNotes.map((note) => updateNote(note))
    );
    if (result.some((r) => !r)) {
      const errorTarget = targetNotes[result.findIndex((r) => !r)];
      throw new Error(
        `Note(${errorTarget.title}) with tag(${tag}) delete failed`
      );
    }
    return true;
  } catch (error) {
    console.error(`Error deleting tag: ${error}`);
    return false;
  }
}
