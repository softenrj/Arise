// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const SWIPE_THRESHOLD = 90;
const SWIPE_OFFSET = 200;

const SPRING_CONFIG = {
    damping: 24,
    stiffness: 260,
    mass: 0.3,
};

export default function MiniPlayerTrackDetails() {
    const { queue, currentIndex } = useAppSelector((state) => state.trackReducer);
    const activeTrack = queue[currentIndex];
    const { skipToNext, skipToPrevious } = useTrack();

    // Optimistic state: updates instantly on swipe without waiting for Redux/TrackPlayer
    const [displayIndex, setDisplayIndex] = useState(currentIndex);

    useEffect(() => {
        setDisplayIndex(currentIndex);
    }, [currentIndex]);

    const displayTrack = queue[displayIndex] ?? activeTrack;

    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const isFirstTrack = displayIndex === 0;
    const isLastTrack = displayIndex === queue.length - 1;

    // Fast local state transition + trigger native skip
    const handleSkip = (direction: 'next' | 'prev') => {
        if (direction === 'next' && !isLastTrack) {
            setDisplayIndex((prev) => prev + 1);
            skipToNext();
        } else if (direction === 'prev' && !isFirstTrack) {
            setDisplayIndex((prev) => prev - 1);
            skipToPrevious();
        }
    };

    // Pre-position next track on opposite side and spring in instantly
    const animateIncomingTrack = (fromLeft: boolean) => {
        'worklet';
        translateX.value = fromLeft ? -SWIPE_OFFSET : SWIPE_OFFSET;
        opacity.value = 0;

        translateX.value = withSpring(0, SPRING_CONFIG);
        opacity.value = withTiming(1, { duration: 120 });
    };

    const panGesture = Gesture.Pan()
        .enabled(!!displayTrack && queue.length > 1)
        .activeOffsetX([-20, 20])
        .onUpdate((event) => {
            let transX = event.translationX;

            if ((isFirstTrack && transX > 0) || (isLastTrack && transX < 0)) {
                transX *= 0.2; // Rubber-band effect
            }

            translateX.value = transX;
            opacity.value = Math.max(0.2, 1 - Math.abs(transX) / SWIPE_OFFSET);
        })
        .onEnd((event) => {
            const transX = event.translationX;

            if (transX < -SWIPE_THRESHOLD && !isLastTrack) {
                translateX.value = withTiming(-SWIPE_OFFSET, { duration: 90 }, (finished) => {
                    if (finished) {
                        scheduleOnRN(handleSkip, 'next');
                        //Immediately animate incoming track from the right
                        animateIncomingTrack(false);
                    }
                });
                opacity.value = withTiming(0, { duration: 90 });
            } else if (transX > SWIPE_THRESHOLD && !isFirstTrack) {
                translateX.value = withTiming(SWIPE_OFFSET, { duration: 90 }, (finished) => {
                    if (finished) {
                        scheduleOnRN(handleSkip, 'prev');
                        // Immediately animate incoming track from the left
                        animateIncomingTrack(true);
                    }
                });
                opacity.value = withTiming(0, { duration: 90 });
            } else {
                // Reset back to center if swipe threshold wasn't met
                translateX.value = withSpring(0, SPRING_CONFIG);
                opacity.value = withTiming(1, { duration: 120 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <View className="flex-1 justify-center overflow-hidden w-full h-full py-2 bg-transparent">
                <Animated.View style={[animatedStyle, { width: '100%' }]}>
                    <Text
                        numberOfLines={1}
                        className="text-white text-sm font-jakarta font-semibold tracking-tight"
                    >
                        {displayTrack?.title ?? 'Not Playing'}
                    </Text>

                    <Text
                        numberOfLines={1}
                        className="text-zinc-300 text-xs font-normal mt-0.5"
                    >
                        {displayTrack?.artist ?? 'Unknown Artist'}
                    </Text>
                </Animated.View>
            </View>
        </GestureDetector>
    );
}