// Copyright (c) 2026 Raj
// See LICENSE for details.

import { setCurrentIndex } from "@/store/reducer/trackplayerSlice";
import { store } from "@/store/store";
import { AriseTrack } from "@/types/database";
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
    private queueIndexMap = new Map<string, number>();

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

        this.currentTrack = { musicId: activeTrack.mediaId, startedAt: Date.now(), recentPlayRecorded: false };
        this.syncRedux(activeTrack.mediaId);
    }

    private syncRedux(musicId: string) {
        const state = store.getState().trackReducer;
        const idx = this.queueIndexMap.get(musicId);

        const currentTrackIndex = state.currentIndex;

        if (typeof idx === 'undefined' || idx === currentTrackIndex) return;
        store.dispatch(setCurrentIndex(idx));
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