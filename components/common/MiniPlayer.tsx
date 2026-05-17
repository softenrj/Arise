// Copyright (c) 2026 Raj
// See LICENSE for details.

import { LinearGradient } from 'expo-linear-gradient';
import { Pause, Play, PlusCircle } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { getColors } from 'react-native-image-colors';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import TrackPlayer, { State, useActiveTrack, usePlaybackState, useProgress } from 'react-native-track-player';
import MiniPlayerTrackDetails from './MiniPlayerTrackDetails';

type GradientColors = [string, string, string];
const DEFAULT_COLORS: GradientColors = ['#0e7490', '#155e75', '#164e63'];
const SLIDER_HEIGHT = 3;
const SLIDER_HEIGHT_ACTIVE = 6;
const HIT_SLOP = 20;

const image = 'https://thewildcattribune.com/wp-content/uploads/2023/05/52890928681_a467a529c4_o-e1685030922246.jpg'

export default function MiniPlayer() {
    const track = useActiveTrack();
    const { state } = usePlaybackState();
    const { position, duration } = useProgress(250);

    const isPlaying = state === State.Playing;
    const artwork = typeof track?.artwork === 'string' ? track.artwork : null;

    const [gradient, setGradient] = React.useState<GradientColors>(DEFAULT_COLORS);

    React.useEffect(() => {
        if (!artwork) {
            setGradient(DEFAULT_COLORS);
            return;
        }

        getColors(image, {
            fallback: DEFAULT_COLORS[0],
            cache: true,
            key: image,
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
    const progressX = useSharedValue(0);
    const isDragging = useSharedValue(false);

    React.useEffect(() => {
        if (!isDragging.value && duration > 0) {
            progressX.value = withTiming((position / duration) * sliderWidth.value, { duration: 200 });
        }
    }, [position, duration]);

    const seekToPosition = (pixelX: number) => {
        if (duration <= 0) return;
        const ratio = Math.max(0, Math.min(1, pixelX / sliderWidth.value));
        const seconds = ratio * duration;
        TrackPlayer.seekTo(seconds);
    };

    const panGesture = Gesture.Pan()
        .hitSlop({ top: HIT_SLOP, bottom: HIT_SLOP })
        .minDistance(0)
        .onBegin((e) => {
            isDragging.value = true;
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            runOnJS(seekToPosition)(clamped);
        })
        .onUpdate((e) => {
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            runOnJS(seekToPosition)(clamped);
        })
        .onEnd(() => { isDragging.value = false; })
        .onFinalize(() => { isDragging.value = false; });

    const trackStyle = useAnimatedStyle(() => ({
        height: withSpring(isDragging.value ? SLIDER_HEIGHT_ACTIVE : SLIDER_HEIGHT, {
            mass: 0.3, damping: 15, stiffness: 200,
        }),
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.35)',
        overflow: 'hidden' as const,
    }));

    const fillStyle = useAnimatedStyle(() => ({
        width: progressX.value,
        height: '100%',
        borderRadius: 4,
    }));

    const thumbStyle = useAnimatedStyle(() => ({
        position: 'absolute' as const,
        top: '50%',
        left: progressX.value - 6,
        marginTop: -6,
        width: 12,
        height: 12,
        borderRadius: 6,
        opacity: withTiming(isDragging.value ? 1 : 0, { duration: 150 }),
        transform: [{ scale: withSpring(isDragging.value ? 1 : 0.1) }],
    }));

    const togglePlay = async () => {
        if (isPlaying) await TrackPlayer.pause();
        else await TrackPlayer.play();
    };

    if (!track) return null;

    return (
        <View className='absolute h-16 mx-1 left-0 right-0 bottom-0 rounded-lg overflow-hidden'>
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
                    <TouchableOpacity onPress={togglePlay} hitSlop={8}>
                        <PlusCircle size={20} color='white' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={togglePlay} hitSlop={8}>
                        {isPlaying
                            ? <Pause size={20} color='white' fill='white' />
                            : <Play size={20} color='white' fill='white' />
                        }
                    </TouchableOpacity>
                </View>

                <GestureDetector gesture={panGesture}>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            zIndex: 50,
                            justifyContent: 'flex-end',
                        }}
                        onLayout={(e) => { sliderWidth.value = e.nativeEvent.layout.width; }}
                    >
                        <Animated.View style={trackStyle}>
                            <Animated.View style={[fillStyle, { backgroundColor: gradient[0] }]} />
                        </Animated.View>
                        <Animated.View style={[thumbStyle, { backgroundColor: gradient[0] }]} />
                    </View>
                </GestureDetector>
            </View>
        </View>
    );
}