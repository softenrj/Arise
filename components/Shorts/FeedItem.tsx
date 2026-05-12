// Copyright (c) 2026 Raj
// See LICENSE for detail

import { useShorts } from '@/hooks/useShorts';
import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import FeedOverLay from './FeedOverLay';

const SLIDER_HEIGHT = 3;
const SLIDER_HEIGHT_ACTIVE = 6;
const HIT_SLOP = 20;
const DOUBLE_TAP_DELAY = 300;

export default function FeedItem({ containerHeight, isActive, }: { containerHeight: number; isActive: boolean }) {
    const { showImage, isHolding, handleHolding } = useShorts();

    // like
    const [isLiked, setIsLiked] = React.useState(false);
    const tapTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleLike = React.useCallback(() => setIsLiked(prev => !prev), [isLiked]);

    // slider property
    const sliderWidth = useSharedValue(0);
    const progressX = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const startX = useSharedValue(0);

    const [isMuted, setIsMuted] = React.useState(false);

    const player = useVideoPlayer(require('@/assets/video/sample.mp4'), (p) => {
        p.loop = true;
        p.volume = 1.0;
        p.muted = false;
        p.timeUpdateEventInterval = 0.25;
    });

    useEvent(player, 'timeUpdate', {
        currentTime: player.currentTime,
        bufferedPosition: 0,
        currentLiveTimestamp: 0,
        currentOffsetFromLive: 0,
    });

    React.useEffect(() => {
        if (isDragging.value) return;
        const pct = player.duration ? player.currentTime / player.duration : 0;
        progressX.value = withTiming(pct * sliderWidth.value, { duration: 250 });
    }, [player.currentTime]);

    React.useEffect(() => {
        if (isActive) player.play();
        else player.pause();
    }, [isActive, player]);

    const seekTo = React.useCallback(
        (x: number) => {
            const total = player.duration;
            if (!total || isNaN(total) || sliderWidth.value === 0) return;
            player.currentTime = Math.max(0, Math.min(1, x / sliderWidth.value)) * total;
        },
        [player]
    );

    const resumePlay = React.useCallback(() => player.play(), [player]);
    const pausePlay = React.useCallback(() => player.pause(), [player]);

    //#regin slider guesture anime
    const panGesture = Gesture.Pan()
        .hitSlop({ top: HIT_SLOP, bottom: HIT_SLOP })
        .minDistance(0)
        .onBegin((e) => {
            isDragging.value = true;
            startX.value = progressX.value;
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            runOnJS(pausePlay)();
            runOnJS(seekTo)(clamped);
        })
        .onUpdate((e) => {
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            runOnJS(seekTo)(clamped);
        })
        .onEnd(() => {
            isDragging.value = false;
            runOnJS(resumePlay)();
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
        opacity: withTiming(showImage ? 0 : 1, { duration: 200 }),
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

    const muteOpacity = useSharedValue(0);
    const muteStyle = useAnimatedStyle(() => ({ opacity: muteOpacity.value }));

    const handlePress = () => {
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
            tapTimeoutRef.current = null;

            toggleLike();
        } else {

            tapTimeoutRef.current = setTimeout(() => {
                // Time ran out! The user didn't tap a second time. 
                tapTimeoutRef.current = null;

                toggleMute();

            }, DOUBLE_TAP_DELAY);
        }

    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        player.muted = next;
        muteOpacity.value = withSequence(
            withTiming(1, { duration: 80 }),
            withDelay(700, withTiming(0, { duration: 300 }))
        );
    }

    React.useEffect(() => {
        return () => {
            if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        };
    }, []);

    const handleLongPress = () => {
        handleHolding(true);
        player.pause();
    };

    const handlePressOut = () => {
        if (isHolding.value) {
            handleHolding(false)
            player.play();
        }
    };

    //#end

    return (
        <Pressable className="relative w-full" style={{ height: containerHeight }}>
            {!showImage &&
                <VideoView
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        width: '100%', height: '100%',
                        zIndex: 0,
                    }}
                    player={player}
                    allowsPictureInPicture
                    contentFit="cover"
                    nativeControls={false}
                />

            }

            {showImage && <Image
                source={{ uri: "https://i.pinimg.com/736x/ec/da/a4/ecdaa4dbb245fa77b72bc31381ae3b5e.jpg" }}
                className='absolute z-0 h-full w-full'
                resizeMode="contain"
            />}

            <Pressable
                onPress={handlePress}
                onLongPress={handleLongPress}
                onPressOut={handlePressOut}
                delayLongPress={250}
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 10,
                }}
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: '50%',
                    zIndex: 10,
                }}
                pointerEvents="none"
            />

            <Animated.View
                pointerEvents="none"
                style={[muteStyle, {
                    position: 'absolute',
                    top: 12, right: 12,
                    zIndex: 30,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderRadius: 50,
                    padding: 6,
                }]}
            >
                <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={18}
                    color="white"
                />
            </Animated.View>

            <FeedOverLay like={isLiked} onLink={toggleLike} />

            <GestureDetector gesture={panGesture}>
                <View
                    style={{
                        position: 'absolute',
                        bottom: -5,
                        left: 0, right: 0,
                        zIndex: 50,
                        paddingBottom: 6,
                        paddingHorizontal: 0,
                        justifyContent: 'flex-end',
                    }}
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

        </Pressable>
    );
}