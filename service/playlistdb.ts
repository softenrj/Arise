// Copyright (c) 2026 Raj
// See LICENSE for details.

import { PlayList, PlayListMusic } from "@/types/database";
import { defaultPlayListCover } from "@/utils/constants";
import * as Crypto from "expo-crypto";
import { SQLiteDatabase } from "expo-sqlite";

const getId = () => Crypto.randomUUID();

export async function PlayListTable(db: SQLiteDatabase) {
  try {
    const sqlCommand = `
            CREATE TABLE IF NOT EXISTS PlayList (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT DEFAULT '',
                description TEXT DEFAULT '',
                cover TEXT ,
                pined INTEGER DEFAULT 0,
                createdAt INTEGER,
                updatedAt INTEGER
            )
        `;
    await db.execAsync(sqlCommand);
  } catch (error) {
    console.error("Error while initiating Playlist db:", error);
  }
}

export async function PlayListMusicTable(db: SQLiteDatabase) {
  try {
    const sqlCommand = `
        CREATE TABLE IF NOT EXISTS PlayList_MUSIC (
            id TEXT PRIMARY KEY NOT NULL,
            musicId TEXT NOT NULL,
            playlistId TEXT NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            createdAt INTEGER,
            updatedAt INTEGER,

            FOREIGN KEY (musicId) REFERENCES Musics(id),
            FOREIGN KEY (playlistId) REFERENCES PlayList(id),

            UNIQUE (playlistId, musicId)
        )
    `;

    await db.execAsync(sqlCommand);
  } catch (error) {
    console.error("Error while initiating Playlist Music db:", error);
  }
}

interface CreatePlayList {
  db: SQLiteDatabase;
  title: string;
  description?: string;
  cover?: string | null;
}

export const createPlayList = async ({
  db,
  title,
  description,
  cover = defaultPlayListCover,
}: CreatePlayList) => {
  try {
    const finalCover = cover || defaultPlayListCover;
    const id = getId();
    const now = Date.now();

    await db.runAsync(
      `
      INSERT INTO PlayList (
        id, title, description, cover, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [id, title, description ?? "", finalCover, now, now],
    );

    return id;
  } catch (error) {
    console.error("Error while creating playlist:", error);
    return null;
  }
};

export const getPlayList = async (db: SQLiteDatabase, sort: 0 | 1 = 1) => {
  try {
    const SORT = sort === 0 ? "DESC" : "ASC";
    const sqlCommand = `
      SELECT *
        FROM PlayList
        ORDER BY pined ${SORT}, updatedAt ${SORT}
    `;

    const playList = (await db.getAllAsync(sqlCommand)) as PlayList[];

    return playList;
  } catch (error) {
    console.error("Error while getting playlist:", error);
    return [];
  }
};

export const getPlayListById = async (db: SQLiteDatabase, id: string) => {
  try {
    const sqlCommand = `
      SELECT *
        FROM PlayList
        WHERE id = ?
    `;

    const playList = (await db.getFirstAsync(sqlCommand, [id])) as PlayList;

    return playList;
  } catch (error) {
    console.error("Error while getting playlist object:", error);
    return null;
  }
};

interface UpdatePlayList {
  db: SQLiteDatabase;
  playList: {
    id: string;
    title: string;
    description?: string;
    cover?: string;
  };
}

export const updatePlayList = async ({ db, playList }: UpdatePlayList) => {
  try {
    if (!playList.id) return null;

    const filteredFields = Object.fromEntries(
      Object.entries(playList).filter(
        ([_, v]) => v !== null && v !== undefined,
      ),
    );

    const keys = Object.keys(filteredFields);

    if (keys.length === 0) return null;
    const setClauses: string[] = [];
    const values: any[] = [];

    keys.forEach((key) => {
      setClauses.push(`${key} = ?`);
      values.push(filteredFields[key]);
    });

    setClauses.push("updatedAt = ?");
    values.push(Date.now());

    values.push(playList.id);

    const sqlCommand = `UPDATE PlayList SET ${setClauses} WHERE id = ?`;
    await db.runAsync(sqlCommand, values);

    const playListObject = await db.runAsync(
      `SELECT * FROM PlayList WHERE id = ?`,
      playList.id,
    );
    return playListObject;
  } catch (error) {
    console.error("Error while updating playlist:", error);
    return null;
  }
};

export const removePlayList = async ({
  db,
  playlistId,
}: {
  db: SQLiteDatabase;
  playlistId: string;
}) => {
  try {
    await db.execAsync("BEGIN TRANSACTION");

    await db.runAsync(
      `
      DELETE FROM PlayList_MUSIC
      WHERE playlistId = ?
      `,
      [playlistId],
    );

    await db.runAsync(
      `
      DELETE FROM PlayList
      WHERE id = ?
      `,
      [playlistId],
    );

    await db.execAsync("COMMIT");

    return true;
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("Error while removing playlist:", error);
    return false;
  }
};

export const appendPlayListMusic = async ({
  db,
  musicId,
  playlistId,
}: {
  db: SQLiteDatabase;
  musicId: string;
  playlistId: string;
}) => {
  try {
    if (!musicId || !playlistId) return null;

    const now = Date.now();
    const id = getId();

    const lastObject = await db.getFirstAsync<{ maxPosition: number }>(
      `
        SELECT MAX(position) as maxPosition
          FROM PlayList_MUSIC
          WHERE playlistId = ?
      `,
      [playlistId],
    );

    const position = (lastObject?.maxPosition ?? -1) + 1;

    const sqlCommand = `INSERT INTO PlayList_MUSIC (
      id, musicId, playlistId, posotion, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?)`;

    await db.runAsync(sqlCommand, [
      id,
      musicId,
      playlistId,
      position,
      now,
      now,
    ]);

    return id;
  } catch (error) {
    console.error("Error while append playlist music:", error);
    return null;
  }
};

export const removePlayListMusic = async ({
  db,
  playlistMusicId,
}: {
  db: SQLiteDatabase;
  playlistMusicId: string;
}) => {
  try {
    await db.runAsync(
      `
      DELETE FROM PlayList_MUSIC
      WHERE id = ?
      `,
      [playlistMusicId],
    );

    return true;
  } catch (error) {
    console.error("Error while removing playlist music:", error);
    return false;
  }
};

export const reorderPlaylistMusic = async ({
  db,
  items,
}: {
  db: SQLiteDatabase;
  items: { id: string }[];
}) => {
  const now = Date.now();

  try {
    await db.execAsync("BEGIN TRANSACTION");

    for (let i = 0; i < items.length; i++) {
      await db.runAsync(
        `
        UPDATE PlayList_MUSIC
        SET position = ?, updatedAt = ?
        WHERE id = ?
        `,
        [i, now, items[i].id],
      );
    }

    await db.execAsync("COMMIT");

    return true;
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("Failed to reorder playlist:", error);
    return false;
  }
};

export const getPlayListMusic = async (db: SQLiteDatabase, id: string) => {
  try {
    const sqlCommand = `
      SELECT * FROM PlayList_MUSIC
      WHERE playlistId = ?
    `;

    const result = (await db.getAllAsync(sqlCommand, [id])) as PlayListMusic[];
    return result;
  } catch (error) {
    console.error("Failed to fetching playlist Music:", error);
    return [];
  }
};
