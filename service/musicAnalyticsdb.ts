// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { SQLiteDatabase } from "expo-sqlite";

export const initMusicAnalyticsDB = async (db: SQLiteDatabase) => {
    try {
        const sqlCommand = `
            CREATE TABLE IF NOT EXISTS music_analytics (
                musicId TEXT PRIMARY KEY NOT NULL,
                playCount INTEGER NOT NULL DEFAULT 0,
                skipCount INTEGER NOT NULL DEFAULT 0,
                completedCount INTEGER NOT NULL DEFAULT 0,
                totalListeningSeconds INTEGER NOT NULL DEFAULT 0,

                firstPlayedAt INTEGER DEFAULT NULL,
                lastPlayedAt INTEGER DEFAULT NULL,

                createdAt INTEGER NOT NULL,
                updatedAt INTEGER NOT NULL
            )
        `

        await db.execAsync(sqlCommand);
        await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_music_analytics_lastplayed ON music_analytics(lastPlayedAt DESC);`);
        await db.execAsync(` CREATE INDEX IF NOT EXISTS idx_music_analytics_playcount ON music_analytics(playCount DESC);`)
    } catch (error) {
        console.error("Error initializing music analytics database:", error);
    }
}

interface UpdateMusicAnalytics {
    musicId: string;
    seconds: number;
    musicDuration: number;
}

export const getMusicAnalytics = async (db: SQLiteDatabase, musicId: string): Promise<any | null> => {
    try {
        const sqlCommand = `
            SELECT * FROM music_analytics WHERE musicId = ?;
        `
        const result = await db.getFirstAsync(sqlCommand, [musicId]);
        return result;
    } catch (error) {
        console.error("Error fetching music analytics:", error);
        return null;
    }
}

export const initializeMusicAnalyticsForMusic = async (db: SQLiteDatabase, musicId: string) => {
    try {
        const now = Date.now();
        const sqlCommand = `
            INSERT OR IGNORE INTO music_analytics (musicId, playCount, skipCount, completedCount, totalListeningSeconds, firstPlayedAt, createdAt, updatedAt)
            VALUES (?, 0, 0, 0, 0, ?, ?, ?);
        `
        await db.runAsync(sqlCommand, [musicId, now, now, now]);

        const analytics = await getMusicAnalytics(db, musicId);
        return analytics;
    } catch (error) {
        console.error("Error initializing music analytics for music:", error);
        return null;
    }
}

export const updateMusicAnalytics = async (db: SQLiteDatabase, updateData: UpdateMusicAnalytics) => {
    try {
        const completionThreshold = 0.8; // 80% or more is considered completed
        const skipThreshold = 0.1; // Played for less than 10% of the song is considered skipped
        const completedRatio = updateData.musicDuration > 0 ? updateData.seconds / updateData.musicDuration : 0;
        const isCompleted = completedRatio >= completionThreshold;
        const isSkipped = completedRatio < skipThreshold;
        const playCount = 1;
        const skipCount = isSkipped ? 1 : 0;
        const completedCount = isCompleted ? 1 : 0;

        const now = Date.now();

        let existingAnalytics = await getMusicAnalytics(db, updateData.musicId);

        if (!existingAnalytics) {
            existingAnalytics = await initializeMusicAnalyticsForMusic(db, updateData.musicId);
        }

        const sqlCommand = `
            UPDATE music_analytics
            SET
                playCount = playCount + ?,
                skipCount = skipCount + ?,
                completedCount = completedCount + ?,
                totalListeningSeconds = totalListeningSeconds + ?,
                lastPlayedAt = ?,
                updatedAt = ?
            WHERE musicId = ?;
        `;

        await db.runAsync(sqlCommand, [playCount, skipCount, completedCount, updateData.seconds, now, now, updateData.musicId]);
    } catch (error) {
        console.error("Error updating music analytics:", error);
    }
}

export const initRecentPlaysDB = async (db: SQLiteDatabase) => {
    try {
        const sqlCommand = `
        CREATE TABLE IF NOT EXISTS RecentPlays (
            id TEXT PRIMARY KEY NOT NULL,
        
            musicId TEXT NOT NULL,

            playedAt INTEGER NOT NULL,

            FOREIGN KEY (musicId)
                REFERENCES Musics(id)
            ON DELETE CASCADE
        );
        `
        await db.execAsync(sqlCommand);
        await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_recentplays_playedat ON RecentPlays(playedAt DESC);`);
    } catch (error) {
        console.error("Error initializing recent plays database:", error);
    }
}

export const addRecentPlay = async (db: SQLiteDatabase, musicId: string) => {
    try {
        const now = Date.now();
        const sqlCommand = `
            INSERT INTO RecentPlays (id, musicId, playedAt)
            VALUES (?, ?, ?);
        `;
        await db.runAsync(sqlCommand, [crypto.randomUUID(), musicId, now]);

        await db.runAsync(`
            DELETE FROM RecentPlays
                WHERE id NOT IN (
                SELECT id
                FROM RecentPlays
                ORDER BY playedAt DESC
                LIMIT ?
            );
            `, [150]);
    } catch (error) {
        console.error("Error adding recent play:", error);
    }
}