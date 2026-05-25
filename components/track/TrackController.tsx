// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import LottieView from 'lottie-react-native';
import { Heart, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useActiveTrack, useProgress } from 'react-native-track-player';

const SLIDER_HEIGHT = 3;
const SLIDER_HEIGHT_ACTIVE = 6;
const HIT_SLOP = 20;

export default function TrackController() {
    const sliderWidth = useSharedValue(0);
    const progressX = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const startX = useSharedValue(0);

    const { position, duration } = useProgress(250);
    const { loopMode, shuffle } = useAppSelector(state => state.trackReducer)

    const track = useActiveTrack();

    const [showLikeAnimation, setShowLikeAnimation] = React.useState<boolean>(false);
    const [isLiked, setIsLiked] = React.useState(false);
    const likeAnimationTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const { skipToPrevious, toggleShuffle, cycleLoopMode, skipToNext, togglePlay, seekTo, play, pause, isPlaying } = useTrack();


    const toggleLike = React.useCallback(() => {
        setIsLiked(prev => {
            if (!prev) handleLikeAnimation();
            return !prev;
        });
    }, []);

    const seekToPosition = (pixelX: number) => {
        if (duration <= 0) return;
        const ratio = Math.max(0, Math.min(1, pixelX / sliderWidth.value));
        const seconds = ratio * duration;
        seekTo(seconds);
    };


    const panGesture = Gesture.Pan()
        .hitSlop({ top: HIT_SLOP, bottom: HIT_SLOP })
        .minDistance(0)
        .onBegin((e) => {
            isDragging.value = true;
            startX.value = progressX.value;
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            runOnJS(pause)();
            runOnJS(seekToPosition)(clamped);
        })
        .onUpdate((e) => {
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            runOnJS(seekToPosition)(clamped);
        })
        .onEnd(() => {
            isDragging.value = false;
            runOnJS(play)();
        })
        .onFinalize(() => {
            isDragging.value = false;
        });

    const trackStyle = useAnimatedStyle(() => ({
        height: withSpring(isDragging.value ? SLIDER_HEIGHT_ACTIVE : SLIDER_HEIGHT, {
            mass: 0.3,
            damping: 15,
            stiffness: 200,
        }),
        borderRadius: 4,
        opacity: 1,
        backgroundColor: 'rgba(255,255,255,0.35)',
        overflow: 'hidden' as const,
    }));

    const fillStyle = useAnimatedStyle(() => ({
        width: progressX.value,
        height: '100%',
        backgroundColor: 'white',
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
        backgroundColor: 'white',
        opacity: withTiming(isDragging.value ? 1 : 0, { duration: 150 }),
        transform: [{ scale: withSpring(isDragging.value ? 1 : 0.1) }],
    }));

    const handleLikeAnimation = React.useCallback(() => {
        setShowLikeAnimation(true);

        if (likeAnimationTimeoutRef.current) {
            clearImmediate(likeAnimationTimeoutRef.current);
        }

        likeAnimationTimeoutRef.current = setTimeout(() => {
            setShowLikeAnimation(false);
        }, 700)
    }, [])

    React.useEffect(() => {
        if (!isDragging.value && duration > 0) {
            progressX.value = withTiming((position / duration) * sliderWidth.value, { duration: 200 });
        }
    }, [position, duration]);


    React.useEffect(() => {
        return () => {
            if (likeAnimationTimeoutRef.current) clearTimeout(likeAnimationTimeoutRef.current);
        };
    }, []);

    return (
        <View className="pb-12 pt-6">

            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-1 pr-4">
                    <Text className="text-white text-2xl font-bold truncate" numberOfLines={1}>
                        {track?.title}
                    </Text>
                    <Text className="text-white/70 text-base mt-1" numberOfLines={1}>
                        {track?.artist}
                    </Text>
                </View>
                <Pressable
                    onPress={toggleLike}
                    className='w-10 h-10 justify-center items-center relative'
                >
                    {!showLikeAnimation && <Heart
                        size={32}
                        color={isLiked ? 'red' : 'white'}
                        fill={isLiked ? 'red' : 'transparent'}
                    />}

                    {showLikeAnimation && (
                        <LottieView
                            source={require('@/assets/json/like.json')}
                            autoPlay
                            loop={false}
                            style={{ width: 85, height: 85, position: 'absolute' }}

                        />
                    )}
                </Pressable>

            </View>

            <GestureDetector gesture={panGesture}>
                <View
                    className='pb-12'
                    onLayout={(e) => {
                        sliderWidth.value = e.nativeEvent.layout.width;
                    }}
                >
                    <Animated.View style={trackStyle}>
                        <Animated.View style={fillStyle} />
                    </Animated.View>
                    <Animated.View style={thumbStyle} />
                </View>
            </GestureDetector>

            <View className="flex-row justify-between items-center">
                <TouchableOpacity hitSlop={10} onPress={toggleShuffle}>
                    <Shuffle size={24} color={shuffle ? "#1DB954" : "#fff"} opacity={shuffle ? 1 : 0.5} />
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10} onPress={skipToPrevious}>
                    <SkipBack size={30} color="#fff" fill={'white'} />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlay} className="w-[4.2rem] h-[4.2rem] bg-white rounded-full items-center justify-center">
                    {isPlaying ? <Pause size={28} color="#000" fill="#000" style={{ marginLeft: 4 }} /> : <Play size={28} color="#000" fill="#000" style={{ marginLeft: 4 }} />}
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10} onPress={skipToNext}>
                    <SkipForward size={30} fill={'white'} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10} onPress={cycleLoopMode} className='justify-center'>
                    {loopMode !== 'track' && <Repeat size={24} color={loopMode !== 'none' ? "#1DB954" : "#fff"} opacity={loopMode !== 'none' ? 1 : 0.5} />}
                    {loopMode === 'track' && <Repeat1 size={24} color={"#1DB954"} />}
                </TouchableOpacity>
            </View>
        </View>
    )
}