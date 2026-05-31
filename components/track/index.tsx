// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useTrackPanle } from '@/hooks/useTrackPanel';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, EllipsisVertical, Hd, ListFilter, Music } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { getColors } from 'react-native-image-colors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveTrack } from 'react-native-track-player';
import Lyrics from './Lyrics';
import TrackController from './TrackController';
import TrackSheet from './TrackSheet';

const BACKGROUND_COLOR = '#121212';

export default function PlayerScreen() {
    const [dominantColor, setDominantColor] = useState<string>(BACKGROUND_COLOR);
    const [vibrantColor, setVibrantColor] = useState<string>(BACKGROUND_COLOR);
    const { open, onClose } = useTrackPanle();
    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const firstPageHeight = screenHeight - insets.top - insets.bottom;

    // ------------------ current music ---------------
    const track = useActiveTrack();

    useEffect(() => {
        if (!track?.artwork) return;
        getColors(track.artwork, {
            fallback: BACKGROUND_COLOR,
            cache: true,
            key: track.artwork,
            quality: 'low',
        })
            .then((colors) => {
                if (colors.platform === 'android') {
                    setDominantColor(colors.dominant || BACKGROUND_COLOR);
                    setVibrantColor(colors.vibrant || colors.dominant || BACKGROUND_COLOR);
                } else if (colors.platform === 'ios') {
                    setDominantColor(colors.background || BACKGROUND_COLOR);
                    setVibrantColor(colors.primary || colors.secondary || BACKGROUND_COLOR);
                } else {
                    setDominantColor(colors.vibrant || BACKGROUND_COLOR);
                    setVibrantColor(colors.lightVibrant || BACKGROUND_COLOR);
                }
            })
            .catch((err) => {
                console.warn("Gradient extraction failed, using defaults:", err);
            });
    }, [track]);

    return (
        <TrackSheet open={open} onClose={onClose}>

            <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                >
                    <LinearGradient
                        colors={[vibrantColor, dominantColor, BACKGROUND_COLOR]}
                        locations={[0, 0.4, 0.85]}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: screenHeight,
                            opacity: 0.8
                        }}
                    />

                    <SafeAreaView className="flex-1 px-6 mb-10">
                        <View style={{ minHeight: firstPageHeight }} className="justify-between">
                            <View className="flex-row justify-between items-center pt-2 pb-4">
                                <TouchableOpacity hitSlop={15} onPress={onClose}>
                                    <ChevronDown size={28} color="#fff" />
                                </TouchableOpacity>

                                <View className="items-center">
                                    <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                                        Playing from playlist
                                    </Text>
                                    <Text className="text-white text-sm font-bold">
                                        Liked Songs
                                    </Text>
                                </View>

                                <TouchableOpacity hitSlop={15}>
                                    <EllipsisVertical size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1 items-center justify-center">
                                {track?.artwork ? <Image
                                    source={{ uri: track.artwork }}
                                    className="w-full aspect-square rounded-md bg-white/5"
                                    resizeMode="cover"
                                /> : <View className='w-16 h-16 rounded-sm bg-slate-100 items-center justify-center'>
                                    <Music size={24} color="#A1A1AA" />
                                </View>}
                            </View>

                            <TrackController />
                        </View>

                        <View className="mb-8 flex-row justify-between items-center">
                            <Hd size={20} color="white" />
                            <ListFilter size={20} color="white" />
                        </View>

                        <Lyrics color={vibrantColor} />
                    </SafeAreaView>
                </ScrollView>
            </View>
        </TrackSheet>
    );
}