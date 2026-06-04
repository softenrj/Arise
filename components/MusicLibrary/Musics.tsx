// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { useTrack } from '@/hooks/useTrack';
import { formatDuration } from '@/service/MusicDuration';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { Music2, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedKeyboard,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { ScanState } from '.';
import MusicMenu from './MusicMenu';

const cleanFilename = (filename: string): string => {
    if (!filename) return 'Unknown Track';
    return filename.replace(/\.[^/.]+$/, '');
};

/** Normalize a string for fuzzy matching — lowercase, strip diacritics */
const normalize = (s: string) =>
    s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

export default function Musics({ scanState }: { scanState: ScanState }) {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const { setupQueue } = useTrack();
    const { musics, onMusicRefresh } = useMusic();

    // ─── Keyboard-aware bottom padding ──────────────────────────────────────
    const keyboard = useAnimatedKeyboard();

    const listContainerStyle = useAnimatedStyle(() => ({
        // Lift the list above the software keyboard so results stay visible
        paddingBottom: withSpring(keyboard.height.value, {
            damping: 20,
            stiffness: 200,
            mass: 0.4,
        }),
    }));

    const focusProgress = useSharedValue(0);
    const handleFocus = useCallback(() => {
        setFocused(true);
        focusProgress.value = withTiming(1, { duration: 180 });
    }, []);

    const handleBlur = useCallback(() => {
        setFocused(false);
        focusProgress.value = withTiming(0, { duration: 180 });
    }, []);

    useEffect(() => {
        onMusicRefresh();
    }, [scanState]);


    const filteredMusics = useMemo<IMusicTrack[]>(() => {
        const q = normalize(query.trim());
        if (!q) return musics;

        return musics.filter((track) => {
            const name = normalize(cleanFilename(track.filename));
            const raw = normalize(track.filename ?? '');
            return name.includes(q) || raw.includes(q);
        });
    }, [musics, query]);

    const clearQuery = useCallback(() => {
        setQuery('');
        inputRef.current?.focus();
    }, []);

    // ─── Playback ────────────────────────────────────────────────────────────
    /**
     * When the user taps a result from a filtered list we still want to start
     * the full (unfiltered) queue at the right index, so playback can continue
     * past the visible results. Fall back to the filtered index if the track
     * isn't found in the full list (shouldn't happen, but defensive).
     */
    const playTrack = useCallback(
        async (item: IMusicTrack, filteredIndex: number) => {
            try {
                const fullIndex = musics.findIndex((m) => m.id === item.id);
                const startIndex = fullIndex !== -1 ? fullIndex : filteredIndex;

                await setupQueue({
                    tracks: getTrackFromMusic(musics),
                    startIndex,
                    playlistName: 'Media',
                    sourceId: null,
                    sourceType: 'default',
                });
            } catch (err) {
                console.error('Failed to set track globally:', err);
            }
        },
        [musics, setupQueue],
    );

    // ─── Render helpers ──────────────────────────────────────────────────────
    const renderTrack = useCallback(
        ({ item, index }: { item: IMusicTrack; index: number }) => (
            <View className="flex-row items-center w-full gap-3 pr-2" key={item.id}>
                <Pressable
                    onPress={() => playTrack(item, index)}
                    className="flex-1 flex-row items-center gap-3"
                >
                    <Image
                        source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                        className="w-16 h-16 rounded-sm bg-slate-100"
                        resizeMethod="resize"
                    />

                    <View className="flex-1 flex-col justify-center">
                        <Text
                            numberOfLines={1}
                            className="text-black text-sm font-jakarta tracking-tight"
                            style={{ fontWeight: '500' }}
                        >
                            {/* Highlight matched portion */}
                            {cleanFilename(item.filename)}
                        </Text>

                        <Text numberOfLines={1} className="text-zinc-500 text-xs mt-0.5">
                            {formatDuration(item.duration)} • Local Audio
                        </Text>
                    </View>
                </Pressable>

                <MusicMenu musicId={item.id} />
            </View>
        ),
        [playTrack],
    );

    const ListEmpty = useMemo(
        () => (
            <View className="py-10 items-center justify-center gap-2">
                {query.trim().length > 0 ? (
                    <>
                        <Search size={22} color="#a1a1aa" />
                        <Text className="text-zinc-500 font-elms text-sm">
                            No results for &ldquo;{query.trim()}&rdquo;
                        </Text>
                        <TouchableOpacity onPress={clearQuery} activeOpacity={0.7}>
                            <Text className="text-zinc-400 text-xs underline">Clear search</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text className="text-zinc-500 font-elms">No music scanned yet.</Text>
                )}
            </View>
        ),
        [query, clearQuery],
    );

    // ─── UI ──────────────────────────────────────────────────────────────────
    return (
        <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center mx-2 gap-3">
                <Music2 size={18} color="#000" />
                <Text className="text-xl text-black font-elms-med">Scanned Music</Text>

                <View className="bg-slate-50 px-3 py-1.5 absolute right-0 rounded-full border border-slate-100">
                    <Text className="text-xs font-elms-med text-slate-500 tracking-wide">
                        {/* Show filtered count / total when searching */}
                        {query.trim()
                            ? `${filteredMusics.length} / ${musics.length}`
                            : musics.length}
                    </Text>
                </View>
            </View>

            <Animated.View
                className={`flex-row items-center rounded-md my-3 px-3 py-1.5 gap-3 bg-zinc-100 border ${focused ? 'border-zinc-300' : 'border-transparent'}`}
            >
                <Search size={17} color={focused ? '#3f3f46' : '#a1a1aa'} />
                <TextInput
                    ref={inputRef}
                    className="flex-1 text-zinc-800 text-sm"
                    placeholder="Search Music"
                    placeholderTextColor="#a1a1aa"
                    value={query}
                    onChangeText={setQuery}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    returnKeyType="search"
                    clearButtonMode="never"
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={clearQuery} activeOpacity={0.6}>
                        <View className="bg-zinc-300 rounded-full p-0.5">
                            <X size={12} color="#52525b" strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* Track list — paddingBottom tracks keyboard height */}
            <Animated.View style={[listContainerStyle, { flex: 1 }]}>
                <FlatList
                    data={filteredMusics}
                    extraData={query}               // re-render when query changes
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTrack}
                    contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    ListEmptyComponent={ListEmpty}
                />
            </Animated.View>
        </View>
    );
}