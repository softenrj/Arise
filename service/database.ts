// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { IMusicTrack } from "@/types/database";
import { SQLiteDatabase } from "expo-sqlite";

export const InitiateDataBase = async (db: SQLiteDatabase, retry?: number) => {
    const DATABASE_VERSION = 1;

    await db.execAsync("PRAGMA journal_mode = 'wal';");

    const result = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );

    if (result && result.user_version >= DATABASE_VERSION) {
        return;
    }

    if (result && result.user_version === 0) {
        await initiateTable(db);
    }

    // Explicitly lock in the version stamp
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

const initiateTable = async (db: SQLiteDatabase) => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Musics (
            id TEXT PRIMARY KEY NOT NULL,
            albumId TEXT,
            filename TEXT NOT NULL,
            duration REAL,
            creationTime INTEGER,
            modificationTime INTEGER,
            mediaType TEXT,
            customCoverUri TEXT,
            isLiked INTEGER DEFAULT 0,
            customVideoUri TEXT
        );
    `);
}


export const createMusic = async (music: IMusicTrack, db: SQLiteDatabase) => {
    try {
        await db.runAsync(
            `INSERT INTO Musics (id, albumId, filename, duration, creationTime, modificationTime, mediaType)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            music.id,
            music.albumId,
            music.filename,
            music.duration,
            music.creationTime,
            music.modificationTime,
            music.mediaType
        );

    } catch (error) {
        console.error("Failed to insert music row into SQLite:", error);
    }
}

export const createMultipleMusics = async (musics: IMusicTrack[], db: SQLiteDatabase) => {
    if (!musics || musics.length === 0) return;

    try {
        await db.withTransactionAsync(async () => {

            const statement = await db.prepareAsync(
                `INSERT OR IGNORE INTO Musics 
                (id, albumId, filename, duration, creationTime, modificationTime, mediaType)
                 VALUES (?, ?, ?, ?, ?, ?, ?);`
            );

            try {
                for (const music of musics) {
                    await statement.executeAsync([
                        music.id,
                        music.albumId,
                        music.filename,
                        music.duration,
                        music.creationTime,
                        music.modificationTime,
                        music.mediaType
                    ]);
                }
            } finally {
                await statement.finalizeAsync();
            }
        });

    } catch (error) {
        console.error("Failed batch insertion of tracks into SQLite:", error);
    }
};

export const getAllMusics = async (db: SQLiteDatabase): Promise<IMusicTrack[]> => {
    try {

        const result = await db.getAllAsync<IMusicTrack>(
            `SELECT * FROM Musics ORDER BY modificationTime DESC;`
        );

        return result;
    } catch (error) {
        console.error("Failed getting music from SQLite:", error);
        return [];
    }
}