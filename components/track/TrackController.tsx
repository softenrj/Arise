// Copyright (c) 2026 Raj 
// See LICENSE for details.

import LottieView from 'lottie-react-native';
import { Heart, Play, Repeat, Shuffle, SkipBack, SkipForward } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const SLIDER_HEIGHT = 3;
const SLIDER_HEIGHT_ACTIVE = 6;
const HIT_SLOP = 20;

export default function TrackController() {
    const sliderWidth = useSharedValue(0);
    const progressX = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const startX = useSharedValue(0);

    const [showLikeAnimation, setShowLikeAnimation] = React.useState<boolean>(false);
    const [isLiked, setIsLiked] = React.useState(false);
    const likeAnimationTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleLike = React.useCallback(() => {
        setIsLiked(prev => {
            if (!prev) handleLikeAnimation();
            return !prev;
        });
    }, []);

    const panGesture = Gesture.Pan()
        .hitSlop({ top: HIT_SLOP, bottom: HIT_SLOP })
        .minDistance(0)
        .onBegin((e) => {
            isDragging.value = true;
            startX.value = progressX.value;
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            // runOnJS(pausePlay)();
            // runOnJS(seekTo)(clamped);
        })
        .onUpdate((e) => {
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            // runOnJS(seekTo)(clamped);
        })
        .onEnd(() => {
            isDragging.value = false;
            // runOnJS(resumePlay)();
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
        return () => {
            if (likeAnimationTimeoutRef.current) clearTimeout(likeAnimationTimeoutRef.current);
        };
    }, []);

    return (
        <View className="px-6 pb-12 pt-6">

            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-1 pr-4">
                    <Text className="text-white text-2xl font-bold truncate" numberOfLines={1}>
                        Song Title
                    </Text>
                    <Text className="text-white/70 text-base mt-1" numberOfLines={1}>
                        Artist Name
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
                <TouchableOpacity hitSlop={10}>
                    <Shuffle size={24} color="#1DB954" />
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10}>
                    <SkipBack size={34} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity className="w-16 h-16 bg-white rounded-full items-center justify-center">
                    <Play size={28} color="#000" fill="#000" style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10}>
                    <SkipForward size={34} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10}>
                    <Repeat size={24} color="#fff" opacity={0.5} />
                </TouchableOpacity>
            </View>
        </View>
    )
}