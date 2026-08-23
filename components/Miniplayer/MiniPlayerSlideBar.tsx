// Copyright (c) 2026 Raj
// See LICENSE for details.

import React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { scheduleOnRN } from 'react-native-worklets';

const SLIDER_HEIGHT = 3;
const SLIDER_HEIGHT_ACTIVE = 6;
const HIT_SLOP = 20;

const MiniPlayerSlideBar = ({ sliderWidth, sliderColor }: { sliderWidth: SharedValue<number>, sliderColor: string }) => {
    const { position, duration } = useProgress(500);
    const progressX = useSharedValue(0);
    const isDragging = useSharedValue(false);

    React.useEffect(() => {
        if (!isDragging.value && duration > 0) {
            progressX.value = withTiming((position / duration) * sliderWidth.value, { duration: 500, easing: Easing.linear });
        }
    }, [position, duration]);

    const seekToPosition = (seconds: number) => {
        if (duration <= 0) return;
        TrackPlayer.seekTo(seconds);
    };

    const panGesture = Gesture.Pan()
        .hitSlop({ top: HIT_SLOP, bottom: HIT_SLOP })
        .minDistance(0)
        .onBegin((e) => {
            isDragging.value = true;
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
        })
        .onUpdate((e) => {
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
        })
        .onEnd((e) => {
            isDragging.value = false;
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            const ratio = Math.max(0, Math.min(1, clamped / sliderWidth.value));
            const seconds = ratio * duration;
            scheduleOnRN(seekToPosition, seconds);
        })
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



    return (
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
                    <Animated.View style={[fillStyle, { backgroundColor: sliderColor }]} />
                </Animated.View>
                <Animated.View style={[thumbStyle, { backgroundColor: sliderColor }]} />
            </View>
        </GestureDetector>
    )
}

export default MiniPlayerSlideBar