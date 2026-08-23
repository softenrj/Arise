import React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useProgress } from 'react-native-track-player';
import { scheduleOnRN } from 'react-native-worklets';
import { WaveThumb } from '../common/WaveThumb';

const SLIDER_HEIGHT = 3;
const SLIDER_HEIGHT_ACTIVE = 6;
const HIT_SLOP = 20;

export default React.memo(function TrackProgressBar({
    waveProgress,
    isPlaying,
    seekToPosition,
}: {
    waveProgress: boolean;
    isPlaying: boolean;
    seekToPosition: (seconds: number) => void;
}) {
    const { position, duration } = useProgress(500);
    const sliderWidth = useSharedValue(0);
    const progressX = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const startX = useSharedValue(0);

    React.useEffect(() => {
        if (!isDragging.value && duration > 0) {
            progressX.value = withTiming((position / duration) * sliderWidth.value, {
                duration: 250,
                easing: Easing.linear,
            });
        }
    }, [position, duration]);


    const panGesture = Gesture.Pan()
        .hitSlop({ top: HIT_SLOP, bottom: HIT_SLOP })
        .minDistance(0)
        .onBegin((e) => {
            'worklet';
            isDragging.value = true;
            startX.value = progressX.value;
            progressX.value = Math.max(0, Math.min(sliderWidth.value, e.x));
        })
        .onUpdate((e) => {
            'worklet';
            progressX.value = Math.max(0, Math.min(sliderWidth.value, e.x));
        })
        .onEnd((e) => {
            'worklet';
            isDragging.value = false;
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;

            if (duration > 0 && sliderWidth.value > 0) {
                const ratio = Math.max(0, Math.min(1, clamped / sliderWidth.value));
                const seconds = ratio * duration;
                scheduleOnRN(seekToPosition, seconds);
            }
        })
        .onFinalize(() => {
            'worklet';
            isDragging.value = false;
        });

    const trackStyle = useAnimatedStyle(() => ({
        height: withSpring(isDragging.value ? SLIDER_HEIGHT_ACTIVE : SLIDER_HEIGHT, {
            mass: 0.3,
            damping: 15,
            stiffness: 200,
        }),
        borderRadius: 4,
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

    return (
        <GestureDetector gesture={panGesture}>
            <View
                onLayout={(e) => {
                    sliderWidth.value = e.nativeEvent.layout.width;
                }}
            >
                {waveProgress ? (
                    <WaveThumb sliderWidth={sliderWidth} isPlaying={isPlaying} progressX={progressX} />
                ) : (
                    <>
                        <Animated.View style={trackStyle}>
                            <Animated.View style={fillStyle} />
                        </Animated.View>
                        <Animated.View style={thumbStyle} />
                    </>
                )}
            </View>
        </GestureDetector>
    );
});


