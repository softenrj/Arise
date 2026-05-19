// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useTrackPanle } from '@/hooks/useTrackPanel';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    ChevronDown,
    EllipsisVertical
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getColors } from 'react-native-image-colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackController from './TrackController';
import TrackSheet from './TrackSheet';

const image = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe1wb5byPEPRHBwhbzdTGXc95ILk68SHWT5w&s";
const BACKGROUND_COLOR = '#121212';

export default function PlayerScreen() {
    const [dominantColor, setDominantColor] = useState<string>(BACKGROUND_COLOR);
    const { open, onClose } = useTrackPanle();

    useEffect(() => {
        if (!image) return;

        getColors(image, {
            fallback: BACKGROUND_COLOR,
            cache: true,
            key: image,
            quality: 'low'
        })
            .then((colors) => {
                if (colors.platform === 'android') {
                    setDominantColor(colors.vibrant || colors.dominant || BACKGROUND_COLOR);
                } else if (colors.platform === 'ios') {
                    setDominantColor(colors.background || colors.primary || BACKGROUND_COLOR);
                } else {
                    setDominantColor(colors.vibrant || BACKGROUND_COLOR);
                }
            })
            .catch((err) => {
                console.warn("Gradient extraction failed, using defaults:", err);
            });
    }, []);

    return (
        <TrackSheet open={open} onClose={onClose}>
            <>
                <LinearGradient
                    colors={[dominantColor, BACKGROUND_COLOR]}
                    locations={[0, 0.9]}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        opacity: 0.9,
                    }}
                />

                <SafeAreaView className="flex-1">
                    <View className="flex-row justify-between items-center px-6 pt-2 pb-6">
                        <TouchableOpacity hitSlop={15} onPress={() => router.back()}>
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

                    <View className="flex-1 items-center justify-center px-6">
                        <Image
                            source={{ uri: image }}
                            className="w-full aspect-square rounded-md bg-white/5"
                            resizeMode="cover"
                        />
                    </View>

                    <TrackController />

                </SafeAreaView>
            </>
        </TrackSheet>
    );
}