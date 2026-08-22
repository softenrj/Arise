// Copyright (c) 2026 Raj
// See LICENSE for details.

import { AriseTrack } from "@/types/database";
import TrackPlayer from "react-native-track-player";
import { getDatabase } from "./database-instance";
import { addRecentPlay, updateMusicAnalytics } from "./musicAnalyticsdb";

type TrackSession = {
    musicId: string;
    startedAt: number;
    recentPlayRecorded: boolean;
    lastAnalyticsUpdateAt: number;
};

class TrackChange {
    private currentTrack: TrackSession | null = null;
    private queueIndexMap = new Map<string, number>();
    private readonly ANALYTICS_THROTTLE_MS = 5000;

    public setQueue(queue: AriseTrack[]) {
        this.queueIndexMap.clear();

        queue.forEach((track, index) => {
            this.queueIndexMap.set(track.musicId, index);
        });
    }

    public async syncTrack() {
        const activeTrack = await TrackPlayer.getActiveTrack();
        if (!activeTrack?.mediaId) return;

        if (this.currentTrack?.musicId === activeTrack.mediaId) {
            return;
        }

        this.currentTrack = { musicId: activeTrack.mediaId, startedAt: Date.now(), recentPlayRecorded: false, lastAnalyticsUpdateAt: Date.now() };
        return this.queueIndexMap.get(activeTrack.mediaId);
    }

    public async onChange(position: number, duration: number) {
        try {
            const index = await this.syncTrack();

            if (!this.currentTrack) {
                return index;
            }

            const db = getDatabase();

            if (position >= duration * 0.05 && !this.currentTrack.recentPlayRecorded) {
                await addRecentPlay(db, this.currentTrack.musicId);
                this.currentTrack.recentPlayRecorded = true;
            }

            /**
             * Analytics: throttle DB writes
             */
            const now = Date.now();
            if (now - this.currentTrack.lastAnalyticsUpdateAt < this.ANALYTICS_THROTTLE_MS) {
                return index;
            }


            await updateMusicAnalytics(db, { musicId: this.currentTrack.musicId, musicDuration: duration, seconds: position });
            this.currentTrack.lastAnalyticsUpdateAt = now;

            return index;
        } catch (error) {
            console.error("Failed to update track analytics:", error);
        }
    }
}

export default new TrackChange();