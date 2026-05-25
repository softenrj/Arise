import { useCallback } from "react";
import TrackPlayer, { State, Track, usePlaybackState } from "react-native-track-player";
import { useAppDispatch } from "./useRedux";

import { addToQueue, clearQueue, cycleLoopMode, playAtIndex, playNext, removeFromQueue, setupQueue, skipToNext, skipToPrevious, toggleShuffle, updateMusic } from "@/store/reducer/trackplayerSlice";

export const useTrack = () => {
    const dispatch = useAppDispatch();
    const { state } = usePlaybackState();

    const isPlaying = state === State.Playing;

    const handleSetupQueue = useCallback(
        ({ tracks, startIndex }: { tracks: Track[]; startIndex?: number }) => {
            return dispatch(setupQueue({ tracks, startIndex }));
        },
        [dispatch]
    );

    const handlePlayAtIndex = useCallback(
        (index: number) => {
            return dispatch(playAtIndex(index));
        },
        [dispatch]
    );

    const handleSkipToNext = useCallback(() => {
        return dispatch(skipToNext());
    }, [dispatch]);

    const handleSkipToPrevious = useCallback(() => {
        return dispatch(skipToPrevious());
    }, [dispatch]);

    const handleAddToQueue = useCallback(
        (tracks: Track[]) => {
            return dispatch(addToQueue(tracks));
        },
        [dispatch]
    );

    const handlePlayNext = useCallback(
        (tracks: Track[]) => {
            return dispatch(playNext(tracks));
        },
        [dispatch]
    );

    const handleRemoveFromQueue = useCallback(
        (index: number) => {
            return dispatch(removeFromQueue(index));
        },
        [dispatch]
    );

    const handleCycleLoopMode = useCallback(() => {
        return dispatch(cycleLoopMode());
    }, [dispatch]);

    const handleUpdateMusic = useCallback((track: Track) => {
        return dispatch(updateMusic(track));
    },
        [dispatch]);

    const handleToggleShuffle = useCallback(() => {
        return dispatch(toggleShuffle());
    }, [dispatch]);

    const handleClearQueue = useCallback(() => {
        return dispatch(clearQueue());
    }, [dispatch]);

    const togglePlay = async () => {
        if (isPlaying) await TrackPlayer.pause();
        else await TrackPlayer.play();
    };

    const seekTo = async (seconds: number) => await TrackPlayer.seekTo(seconds);
    const pause = async () => await TrackPlayer.pause();
    const play = async () => await TrackPlayer.play();

    return {
        setupQueue: handleSetupQueue,
        playAtIndex: handlePlayAtIndex,
        skipToNext: handleSkipToNext,
        skipToPrevious: handleSkipToPrevious,
        addToQueue: handleAddToQueue,
        playNext: handlePlayNext,
        removeFromQueue: handleRemoveFromQueue,
        cycleLoopMode: handleCycleLoopMode,
        updateMusic: handleUpdateMusic,
        toggleShuffle: handleToggleShuffle,
        clearQueue: handleClearQueue,
        togglePlay: togglePlay,
        seekTo: seekTo,
        play: play,
        pause: pause,
        isPlaying
    };
};