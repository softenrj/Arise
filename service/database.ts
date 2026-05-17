// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { IMusicTrack } from "@/types/database";
import { SQLiteDatabase } from "expo-sqlite";

export const InitiateDataBase = async (db: SQLiteDatabase) => {
    const TARGET_DATABASE_VERSION = 2;

    await db.execAsync("PRAGMA journal_mode = 'wal';");

    const result = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );

    const currentVersion = result?.user_version ?? 0;

    if (currentVersion >= TARGET_DATABASE_VERSION) {
        return;
    }

    if (currentVersion === 0) {
        await initiateTable(db);
    } else if (currentVersion === 1) {
        await migrateV1ToV2(db);
    }

    await db.execAsync(`PRAGMA user_version = ${TARGET_DATABASE_VERSION}`);
};

const initiateTable = async (db: SQLiteDatabase) => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Musics (
            id TEXT PRIMARY KEY NOT NULL,
            uri TEXT NOT NULL,
            filename TEXT NOT NULL,
            title TEXT,
            artist TEXT DEFAULT 'Unknown Artist',
            album TEXT DEFAULT 'Unknown Album',
            albumArtist TEXT,
            albumId TEXT,
            duration REAL,
            trackNumber INTEGER DEFAULT 0,
            year INTEGER,
            artwork TEXT, 
            isLiked INTEGER DEFAULT 0,
            creationTime INTEGER,
            modificationTime INTEGER,
            customCoverUri TEXT,
            customVideoUri TEXT
        );
    `);

    await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_musics_artist ON Musics(artist);
        CREATE INDEX IF NOT EXISTS idx_musics_album ON Musics(album);
        CREATE INDEX IF NOT EXISTS idx_musics_isLiked ON Musics(isLiked);
    `);
};

const migrateV1ToV2 = async (db: SQLiteDatabase) => {
    try {
        await db.execAsync(`
            ALTER TABLE Musics ADD COLUMN uri TEXT NOT NULL DEFAULT '';
            ALTER TABLE Musics ADD COLUMN title TEXT;
            ALTER TABLE Musics ADD COLUMN artist TEXT DEFAULT 'Unknown Artist';
            ALTER TABLE Musics ADD COLUMN album TEXT DEFAULT 'Unknown Album';
            ALTER TABLE Musics ADD COLUMN albumArtist TEXT;
            ALTER TABLE Musics ADD COLUMN trackNumber INTEGER DEFAULT 0;
            ALTER TABLE Musics ADD COLUMN year INTEGER;
            ALTER TABLE Musics ADD COLUMN artwork TEXT;
        `);

        await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_musics_artist ON Musics(artist);
            CREATE INDEX IF NOT EXISTS idx_musics_album ON Musics(album);
            CREATE INDEX IF NOT EXISTS idx_musics_isLiked ON Musics(isLiked);
        `);
    } catch (e) {
        console.error("Migration from V1 to V2 failed:", e);
    }
};

export const createMusic = async (music: IMusicTrack, db: SQLiteDatabase) => {
    try {
        await db.runAsync(
            `INSERT OR IGNORE INTO Musics (
                id, uri, filename, title, artist, album, albumArtist, albumId, 
                duration, trackNumber, year, artwork, isLiked, creationTime, 
                modificationTime, customCoverUri, customVideoUri
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            music.id,
            music.uri,
            music.filename,
            music.title,
            music.artist,
            music.album,
            music.albumArtist,
            music.albumId,
            music.duration,
            music.trackNumber,
            music.year,
            music.isLiked ?? 0,
            music.creationTime,
            music.modificationTime,
            music.customCoverUri ?? null,
            music.customVideoUri ?? null
        );
    } catch (error) {
        console.error("Failed to insert music row into SQLite:", error);
    }
};

export const createMultipleMusics = async (musics: IMusicTrack[], db: SQLiteDatabase) => {
    if (!musics || musics.length === 0) return;

    try {
        await db.withTransactionAsync(async () => {
            const statement = await db.prepareAsync(
                `INSERT OR IGNORE INTO Musics (
                    id, uri, filename, title, artist, album, albumArtist, albumId, 
                    duration, trackNumber, year, artwork, isLiked, creationTime, 
                    modificationTime, customCoverUri, customVideoUri
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
            );

            try {
                for (const music of musics) {
                    await statement.executeAsync([
                        music.id,
                        music.uri,
                        music.filename,
                        music.title,
                        music.artist,
                        music.album,
                        music.albumArtist,
                        music.albumId,
                        music.duration,
                        music.trackNumber,
                        music.year,
                        music.isLiked ?? 0,
                        music.creationTime,
                        music.modificationTime,
                        music.customCoverUri ?? null,
                        music.customVideoUri ?? null
                    ] as any[]);
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
};