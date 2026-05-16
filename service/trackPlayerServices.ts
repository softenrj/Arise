// src/service.ts
import TrackPlayer, { Event } from 'react-native-track-player';

export async function PlaybackService() {

    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

    // Fired when seeking via notification scrubber
    TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) =>
        TrackPlayer.seekTo(position)
    );

    // Fired when the audio output changes (e.g. headphones unplugged)
    TrackPlayer.addEventListener(Event.RemoteDuck, async ({ paused, permanent }) => {
        if (permanent) {
            await TrackPlayer.stop();
        } else {
            paused ? await TrackPlayer.pause() : await TrackPlayer.play();
        }
    });
}