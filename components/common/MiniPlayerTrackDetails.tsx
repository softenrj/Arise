// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import TrackPlayer from 'react-native-track-player';

const SWIPE_THRESHOLD = 50;
const SWIPE_OFFSET = 200;

const SPRING_CONFIG = {
    damping: 22,
    stiffness: 200,
    mass: 0.4,
};

export default function MiniPlayerTrackDetails() {
    const { queue, currentIndex } = useAppSelector((state) => state.trackReducer);
    const track = queue[currentIndex];

    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const prevTrackId = useRef(track?.id);

    const resetPositions = () => {
        'worklet';

        translateX.value = withSpring(0, SPRING_CONFIG);
        opacity.value = withTiming(1, { duration: 150 });
    };

    const skipToNext = async () => {
        try {
            await TrackPlayer.skipToNext();
        } catch {
            resetPositions();
        }
    };

    const skipToPrevious = async () => {
        try {
            await TrackPlayer.skipToPrevious();
        } catch {
            resetPositions();
        }
    };

    useEffect(() => {
        if (track?.id !== prevTrackId.current) {
            const currentOffset = translateX.value;

            if (currentOffset < 0) {
                translateX.value = SWIPE_OFFSET;
            } else if (currentOffset > 0) {
                translateX.value = -SWIPE_OFFSET;
            } else {
                translateX.value = 35;
            }

            opacity.value = 0;

            translateX.value = withSpring(0, SPRING_CONFIG);
            opacity.value = withTiming(1, { duration: 180 });

            prevTrackId.current = track?.id;
        }
    }, [track?.id]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.value = event.translationX;
            opacity.value = Math.max(
                0.2,
                1 - Math.abs(event.translationX) / SWIPE_OFFSET
            );
        })
        .onEnd((event) => {
            if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withTiming(
                    -SWIPE_OFFSET,
                    { duration: 100 },
                    (finished) => {
                        if (finished) {
                            runOnJS(skipToNext)();
                        }
                    }
                );

                opacity.value = withTiming(0, { duration: 100 });
            } else if (event.translationX > SWIPE_THRESHOLD) {
                translateX.value = withTiming(
                    SWIPE_OFFSET,
                    { duration: 100 },
                    (finished) => {
                        if (finished) {
                            runOnJS(skipToPrevious)();
                        }
                    }
                );

                opacity.value = withTiming(0, { duration: 100 });
            } else {
                resetPositions();
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <View className="flex-1 justify-center overflow-hidden w-full h-full py-2 bg-transparent">
                <Animated.View
                    style={[animatedStyle, { width: '100%' }]}
                >
                    <Text
                        numberOfLines={1}
                        className="text-white text-sm font-jakarta font-semibold tracking-tight"
                    >
                        {track?.title ?? 'Not Playing'}
                    </Text>

                    <Text
                        numberOfLines={1}
                        className="text-zinc-300 text-xs font-normal mt-0.5"
                    >
                        {track?.artist ?? 'Unknown Artist'}
                    </Text>
                </Animated.View>
            </View>
        </GestureDetector>
    );
}