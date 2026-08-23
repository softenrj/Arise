// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { useTrackPanle } from '@/hooks/useTrackPanel';
import { LinearGradient } from 'expo-linear-gradient';
import { Pause, Play, PlusCircle } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import { getColors } from 'react-native-image-colors';
import { useSharedValue } from 'react-native-reanimated';
import { State, usePlaybackState } from 'react-native-track-player';
import AddToPlayList from '../common/AddToPlayList';
import MiniPlayerSlideBar from './MiniPlayerSlideBar';
import MiniPlayerTrackDetails from './MiniPlayerTrackDetails';

export type GradientColors = [string, string, string];
export const DEFAULT_COLORS: GradientColors = ['#0e7490', '#155e75', '#164e63'];


export default function MiniPlayer() {
    const { onOpen } = useTrackPanle();
    const { queue, currentIndex } = useAppSelector((state) => state.trackReducer);
    const track = queue[currentIndex];

    const { state } = usePlaybackState();
    const { togglePlay } = useTrack();
    const isPlaying = state === State.Playing;
    const artwork = track?.artwork;
    const [openAddtoPlaylist, setOpenAddtoPlaylist] = React.useState(false);

    const handleOpenAddToPlayList = React.useCallback(() => { setOpenAddtoPlaylist(true) }, []);

    const handleOnCloseAddToPlayList = React.useCallback(() => { setOpenAddtoPlaylist(false) }, []);

    const [gradient, setGradient] = React.useState<GradientColors>(DEFAULT_COLORS);

    React.useEffect(() => {
        if (!artwork) {
            setGradient(DEFAULT_COLORS);
            return;
        }

        getColors(artwork, {
            fallback: DEFAULT_COLORS[0],
            cache: true,
            key: artwork,
            quality: 'low'
        })
            .then((colors) => {

                if (colors.platform === 'android') {
                    const c1 = colors.darkVibrant || colors.dominant || DEFAULT_COLORS[0];
                    const c2 = colors.vibrant || colors.muted || DEFAULT_COLORS[1];
                    const c3 = colors.darkMuted || colors.average || DEFAULT_COLORS[2];
                    setGradient([c1, c2, c3]);
                } else if (colors.platform === 'ios') {
                    const c1 = colors.primary || DEFAULT_COLORS[0];
                    const c2 = colors.secondary || DEFAULT_COLORS[1];
                    const c3 = colors.background || DEFAULT_COLORS[2];
                    setGradient([c1, c2, c3]);
                } else {
                    const c1 = colors.darkVibrant || DEFAULT_COLORS[0];
                    const c2 = colors.vibrant || DEFAULT_COLORS[1];
                    const c3 = colors.darkMuted || DEFAULT_COLORS[2];
                    setGradient([c1, c2, c3]);
                }
            })
            .catch((err) => {

                console.warn("Gradient extraction failed, using defaults:", err);
                setGradient(DEFAULT_COLORS);
            });
    }, [artwork]);

    const sliderWidth = useSharedValue(0);


    if (!track) return null;

    return (
        <>
            <Pressable onPress={onOpen} className='absolute h-16 mx-1 left-0 right-0 bottom-0 rounded-lg overflow-hidden'>
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.3, y: 0 }}
                    className='absolute inset-0 h-full rounded-lg'
                    pointerEvents="none"
                />

                <View
                    className='p-2 flex-row items-center justify-between w-full h-full'
                    onLayout={(e) => { sliderWidth.value = e.nativeEvent.layout.width; }}
                >
                    <View className='flex-row items-center gap-3 flex-1 pr-4'>
                        {artwork ? (
                            <Image source={{ uri: artwork }} className='h-full aspect-square rounded-md' />
                        ) : (
                            <View className='h-full aspect-square rounded-md bg-white/20' />
                        )}

                        <MiniPlayerTrackDetails />
                    </View>

                    <View className='flex-row items-center gap-4 px-2'>
                        <TouchableOpacity onPress={handleOpenAddToPlayList} hitSlop={8}>
                            <PlusCircle size={20} color='white' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={togglePlay} hitSlop={8}>
                            {isPlaying
                                ? <Pause size={20} color='white' fill='white' />
                                : <Play size={20} color='white' fill='white' />
                            }
                        </TouchableOpacity>
                    </View>

                    <MiniPlayerSlideBar sliderWidth={sliderWidth} sliderColor={gradient[0]} />
                </View>
            </Pressable>
            <AddToPlayList musicId={track.mediaId!} isVisible={openAddtoPlaylist} onClose={handleOnCloseAddToPlayList} /></>
    );
}