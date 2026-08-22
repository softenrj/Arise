// Copyright (c) 2026 Raj
// See LICENSE for details.

import TrackChange from "@/service/musicChange";
import { setCurrentIndex } from "@/store/reducer/trackplayerSlice";
import { store } from "@/store/store";
import TrackPlayer, { Event } from 'react-native-track-player';

export async function PlaybackService() {
    const trackChanger = TrackChange;

    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        TrackPlayer.play();
        const index = await TrackChange.syncTrack();
        if (typeof index !== "undefined") {
            store.dispatch(setCurrentIndex(index));
        }
    });


    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

    // New active track
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async () => {
        const index = await TrackChange.syncTrack();
        if (index !== undefined) store.dispatch(setCurrentIndex(index));
    });

    // Position / analytics updates
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async ({ position, duration }) => {
        const index = await TrackChange.onChange(position, duration);

        if (index !== undefined) store.dispatch(setCurrentIndex(index));
    });

    // Fired when seeking via notification scrubber
    TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => {
        TrackPlayer.seekTo(position)
    });

    // Fired when the audio output changes (e.g. headphones unplugged)
    TrackPlayer.addEventListener(Event.RemoteDuck, async ({ paused, permanent }) => {
        if (permanent) {
            await TrackPlayer.stop();
        } else {
            paused ? await TrackPlayer.pause() : await TrackPlayer.play();
        }
    });
}