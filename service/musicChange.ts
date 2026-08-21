// Copyright (c) 2026 Raj
// See LICENSE for details.

import TrackPlayer from "react-native-track-player";
import { getDatabase } from "./database-instance";
import { addRecentPlay, updateMusicAnalytics } from "./musicAnalyticsdb";

type TrackSession = {
    musicId: string;
    startedAt: number;
    recentPlayRecorded: boolean;
};

class TrackChange {
    private currentTrack: TrackSession | null = null;

    public async syncTrack() {
        const activeTrack = await TrackPlayer.getActiveTrack();

        if (!activeTrack?.mediaId) return;

        if (this.currentTrack?.musicId === activeTrack.mediaId) {
            return;
        }

        this.currentTrack = { musicId: activeTrack.mediaId, startedAt: Date.now(), recentPlayRecorded: false };
    }

    public async onChange(position: number, duration: number) {
        try {
            const db = getDatabase();
            await this.syncTrack();

            if (!this.currentTrack) return;

            if (position >= 15 && !this.currentTrack.recentPlayRecorded) {
                await addRecentPlay(db, this.currentTrack.musicId);
                this.currentTrack.recentPlayRecorded = true;
            }

            // Don't necessarily write this every 250ms.
            await updateMusicAnalytics(db, { musicId: this.currentTrack.musicId, musicDuration: duration, seconds: position });
        } catch (error) {
            console.error("Failed to update track analytics:", error);
        }
    }
}

export default new TrackChange();