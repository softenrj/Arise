// Copyright (c) 2026 Raj
// See LICENSE for details.

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import TrackPlayer, { RepeatMode, Track } from "react-native-track-player";

export type LoopMode = 'none' | 'track' | 'queue';

interface ArisePlayerState {
    queue: Track[];
    originalQueue: Track[];
    currentIndex: number;
    loopMode: LoopMode;
    shuffle: boolean;
    isPlaying: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const LOOP_CYCLE: LoopMode[] = ['none', 'track', 'queue'];

const REPEAT_MODE_MAP: Record<LoopMode, RepeatMode> = {
    none: RepeatMode.Off,
    track: RepeatMode.Track,
    queue: RepeatMode.Queue,
};


export const setupQueue = createAsyncThunk(
    'trackplayer/setupQueue',
    async ({ tracks, startIndex = 0 }: { tracks: Track[]; startIndex?: number }) => {
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
        await TrackPlayer.skip(startIndex);
        await TrackPlayer.play();
        return { tracks, startIndex };
    }
);


export const playAtIndex = createAsyncThunk(
    'trackplayer/playAtIndex',
    async (index: number) => {
        await TrackPlayer.skip(index);
        await TrackPlayer.play();
        return index;
    }
);


export const skipToNext = createAsyncThunk(
    'trackplayer/skipToNext',
    async () => {
        await TrackPlayer.skipToNext();
        const index = await TrackPlayer.getActiveTrackIndex();
        return index ?? 0;
    }
);


export const skipToPrevious = createAsyncThunk(
    'trackplayer/skipToPrevious',
    async () => {
        await TrackPlayer.skipToPrevious();
        const index = await TrackPlayer.getActiveTrackIndex();
        return index ?? 0;
    }
);

export const addToQueue = createAsyncThunk(
    'trackplayer/addToQueue',
    async (tracks: Track[]) => {
        await TrackPlayer.add(tracks);
        return tracks;
    }
);

export const playNext = createAsyncThunk(
    'trackplayer/playNext',
    async (tracks: Track[], { getState }) => {
        const state = (getState() as { trackplayer: ArisePlayerState }).trackplayer;
        const insertAt = state.currentIndex + 1;
        await TrackPlayer.add(tracks, insertAt);
        return { tracks, insertAt };
    }
);

export const removeFromQueue = createAsyncThunk(
    'trackplayer/removeFromQueue',
    async (index: number) => {
        await TrackPlayer.remove(index);
        return index;
    }
);

export const cycleLoopMode = createAsyncThunk(
    'trackplayer/cycleLoopMode',
    async (_, { getState }) => {
        const state = (getState() as { trackplayer: ArisePlayerState }).trackplayer;
        const next = LOOP_CYCLE[(LOOP_CYCLE.indexOf(state.loopMode) + 1) % LOOP_CYCLE.length];
        await TrackPlayer.setRepeatMode(REPEAT_MODE_MAP[next]);
        return next;
    }
);

export const toggleShuffle = createAsyncThunk(
    'trackplayer/toggleShuffle',
    async (_, { getState }) => {
        const state = (getState() as { trackplayer: ArisePlayerState }).trackplayer;
        const currentTrack = state.queue[state.currentIndex];

        if (!state.shuffle) {

            const rest = state.queue.filter((_, i) => i !== state.currentIndex);
            const shuffled = [currentTrack, ...shuffleArray(rest)];
            await TrackPlayer.reset();
            await TrackPlayer.add(shuffled);
            await TrackPlayer.skip(0);
            await TrackPlayer.play();
            return { shuffle: true, shuffledQueue: shuffled };
        } else {
            const restored = state.originalQueue;
            const resumeIndex = restored.findIndex((t) => t.id === currentTrack?.id) ?? 0;
            await TrackPlayer.reset();
            await TrackPlayer.add(restored);
            await TrackPlayer.skip(resumeIndex);
            await TrackPlayer.play();
            return { shuffle: false, resumeIndex };
        }
    }
);


export const clearQueue = createAsyncThunk(
    'trackplayer/clearQueue',
    async () => {
        await TrackPlayer.reset();
    }
);


const initialState: ArisePlayerState = {
    queue: [],
    originalQueue: [],
    currentIndex: 0,
    loopMode: 'none',
    shuffle: false,
    isPlaying: false,
};

const trackPlayerSlice = createSlice({
    name: 'trackplayer',
    initialState,
    reducers: {

        setCurrentIndex(state, action: PayloadAction<number>) {
            state.currentIndex = action.payload;
        },
        setIsPlaying(state, action: PayloadAction<boolean>) {
            state.isPlaying = action.payload;
        },
    },
    extraReducers: (builder) => {

        builder.addCase(setupQueue.fulfilled, (state, action) => {
            state.queue = action.payload.tracks;
            state.originalQueue = action.payload.tracks;
            state.currentIndex = action.payload.startIndex;
            state.isPlaying = true;
            // Reset shuffle when a new queue is loaded
            state.shuffle = false;
        });

        builder.addCase(playAtIndex.fulfilled, (state, action) => {
            state.currentIndex = action.payload;
            state.isPlaying = true;
        });

        builder.addCase(skipToNext.fulfilled, (state, action) => {
            state.currentIndex = action.payload;
        });

        builder.addCase(skipToPrevious.fulfilled, (state, action) => {
            state.currentIndex = action.payload;
        });

        builder.addCase(addToQueue.fulfilled, (state, action) => {
            state.queue = [...state.queue, ...action.payload];
            if (!state.shuffle) state.originalQueue = state.queue;
        });

        builder.addCase(playNext.fulfilled, (state, action) => {
            const { tracks, insertAt } = action.payload;
            const newQueue = [...state.queue];
            newQueue.splice(insertAt, 0, ...tracks);
            state.queue = newQueue;
            if (!state.shuffle) state.originalQueue = newQueue;
        });


        builder.addCase(removeFromQueue.fulfilled, (state, action) => {
            state.queue = state.queue.filter((_, i) => i !== action.payload);
            if (!state.shuffle) state.originalQueue = state.queue;
            if (action.payload < state.currentIndex) state.currentIndex -= 1;
        });


        builder.addCase(cycleLoopMode.fulfilled, (state, action) => {
            state.loopMode = action.payload;
        });

        builder.addCase(toggleShuffle.fulfilled, (state, action) => {
            state.shuffle = action.payload.shuffle;
            if (action.payload.shuffle && 'shuffledQueue' in action.payload) {
                state.queue = action.payload.shuffledQueue!;
                state.currentIndex = 0;
            } else if (!action.payload.shuffle && 'resumeIndex' in action.payload) {
                state.queue = state.originalQueue;
                state.currentIndex = action.payload.resumeIndex!;
            }
        });

        builder.addCase(clearQueue.fulfilled, (state) => {
            state.queue = [];
            state.originalQueue = [];
            state.currentIndex = 0;
            state.isPlaying = false;
            state.shuffle = false;
        });
    },
});

export const { setCurrentIndex, setIsPlaying } = trackPlayerSlice.actions;
export default trackPlayerSlice.reducer;


export const selectQueue = (state: { trackplayer: ArisePlayerState }) => state.trackplayer.queue;
export const selectCurrentIndex = (state: { trackplayer: ArisePlayerState }) => state.trackplayer.currentIndex;
export const selectCurrentTrack = (state: { trackplayer: ArisePlayerState }) => state.trackplayer.queue[state.trackplayer.currentIndex];
export const selectLoopMode = (state: { trackplayer: ArisePlayerState }) => state.trackplayer.loopMode;
export const selectShuffle = (state: { trackplayer: ArisePlayerState }) => state.trackplayer.shuffle;
export const selectIsPlaying = (state: { trackplayer: ArisePlayerState }) => state.trackplayer.isPlaying;
export const selectQueueLength = (state: { trackplayer: ArisePlayerState }) => state.trackplayer.queue.length;