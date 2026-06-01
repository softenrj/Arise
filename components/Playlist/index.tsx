// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppTheme } from '@/hooks/useAppTheme';
import { usePlaylist } from '@/hooks/usePlaylist';
import { getPlayListById, getPlayListMusic } from '@/service/playlistdb';
import { defaultPlayListCover } from '@/utils/constants';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native'; // ❌ Removed ScrollView
import { getColors } from 'react-native-image-colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import MiniPlayer from '../common/MiniPlayer';
import { AppTheme } from '../context/apptheme';
import PlayListControls from './PlayListControls';
import PlayListMusic from './PlayListMusic';

const image = "https://template.canva.com/EAGYFRbnbek/2/0/800w-fOdQ6rP7qsA.jpg";
const BACKGROUND_COLOR = '#121212';

export default function PlaylistScreen({ playlistId }: { playlistId: string }) {
    const { setTheme } = useAppTheme();
    const router = useRouter();
    const db = useSQLiteContext();
    const { setPlayList, setPlayListMusic, playlist } = usePlaylist();

    const [gradient, setGradient] = useState<string[]>(['transparent', BACKGROUND_COLOR]);

    useEffect(() => {
        if (!playlist?.cover) return;

        getColors(image, {
            fallback: BACKGROUND_COLOR,
            cache: true,
            key: playlist.cover,
            quality: 'low'
        })
            .then((colors) => {
                let extractedColor = BACKGROUND_COLOR;

                if (colors.platform === 'android') {
                    extractedColor = colors.vibrant || colors.dominant || BACKGROUND_COLOR;
                } else if (colors.platform === 'ios') {
                    extractedColor = colors.primary || BACKGROUND_COLOR;
                } else {
                    extractedColor = colors.vibrant || BACKGROUND_COLOR;
                }

                setGradient([extractedColor, BACKGROUND_COLOR]);
            })
            .catch((err) => {
                console.warn("Gradient extraction failed, using defaults:", err);
            });
    }, []);


    const loadPlayList = async () => {
        const response = await Promise.all([
            getPlayListById(db, playlistId),
            getPlayListMusic(db, playlistId)
        ]);
        if (response[0]) setPlayList(response[0]);
        if (response[1]) setPlayListMusic(response[1]);
    }

    React.useEffect(() => {
        loadPlayList();
    }, [playlistId])

    useFocusEffect(React.useCallback(() => {
        setTheme(AppTheme.dark);
        return () => setTheme(AppTheme.light);
    }, []));

    const ListHeader = () => (
        <View>
            <ImageBackground
                className='w-full aspect-square'
                style={{ aspectRatio: 1 / 1 }}
                source={{ uri: playlist?.cover || defaultPlayListCover }}
            >
                <SafeAreaView className='relative p-4 z-20' edges={['top']}>
                    <Pressable
                        className="w-10 h-10 items-center justify-center rounded-md bg-black/30"
                        hitSlop={12}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={22} color='white' strokeWidth={2.5} />
                    </Pressable>
                </SafeAreaView>

                <LinearGradient
                    colors={['transparent', 'rgba(18, 18, 18, 0.6)', BACKGROUND_COLOR]}
                    locations={[0.4, 0.8, 1]}
                    style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        height: '100%',
                        zIndex: 10,
                    }}
                    pointerEvents="none"
                />

                <View className='absolute bottom-6 left-5 right-5 z-20'>
                    <Text numberOfLines={2} className='text-white font-bold text-4xl mb-2'>
                        {playlist?.title}
                    </Text>
                    <Text numberOfLines={2} className='text-gray-300 text-sm leading-5'>
                        {playlist?.description}
                    </Text>
                </View>
            </ImageBackground>

            <PlayListControls />
        </View>
    );

    return (
        <View className='flex-1 bg-white' style={{ backgroundColor: gradient[1] }}>
            <FocusAwareStatusBar animated style='light' />

            <View className='flex-1'>
                <LinearGradient
                    colors={gradient as any}
                    style={{
                        position: 'absolute',
                        top: 400, left: 0, right: 0,
                        height: 300,
                        opacity: 0.35,
                    }}
                    pointerEvents="none"
                />

                <PlayListMusic header={<ListHeader />} />
            </View>

            <MiniPlayer />
        </View>
    );
}