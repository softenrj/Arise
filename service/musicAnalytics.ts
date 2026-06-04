// Copyright (c) 2026 Raj 
// See LICENSE for details.

import TrackPlayer from "react-native-track-player";
import { getDatabase } from "./database-instance";
import { addRecentPlay, updateMusicAnalytics } from "./musicAnalyticsdb";

interface TrackSession {
    musicId: string;
    startedAt: number;
}

let currentSession: TrackSession | null = null;

export const finalizeCurrentTrack = async () => {
    const db = getDatabase();
    if (!db) return;

    try {
        if (currentSession) {
            const { position, duration } = await TrackPlayer.getProgress();

            await updateMusicAnalytics(db, {
                musicId: currentSession?.musicId,
                seconds: position,
                musicDuration: duration,
            });

            if (position >= 15) {
                await addRecentPlay(db, currentSession?.musicId);
            }
        }

        const activeTrack = await TrackPlayer.getActiveTrack();

        if (!activeTrack?.mediaId) {
            currentSession = null;
            return;
        }

        currentSession = { musicId: activeTrack.mediaId, startedAt: Date.now() };
    } catch (error) {
        console.error("Failed to finalize track analytics:", error);
    }
};