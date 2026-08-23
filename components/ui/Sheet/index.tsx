// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SheetProviderProps {
    open?: boolean;
    onClose?: () => void;
    snap?: number;
    className?: string;
    duration?: number;
    children: React.ReactNode;
    closeClassName?: string;
}

const SPRING_CONFIG = {
    damping: 25,
    stiffness: 280,
    mass: 0.3,
};

export default function SheetProvider({
    open,
    onClose,
    snap = 0.6,
    duration = 200,
    className = 'bg-white',
    children,
    closeClassName
}: SheetProviderProps) {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const context = useSharedValue(0);
    const SHEET_HEIGHT = SCREEN_HEIGHT * snap;

    const performClose = () => {
        'worklet';
        translateY.value = withTiming(
            SCREEN_HEIGHT,
            { duration: 220, easing: Easing.in(Easing.quad) },
            (finished) => {
                if (finished && onClose) {
                    scheduleOnRN(onClose);
                }
            }
        );
    };

    React.useEffect(() => {
        if (open) {
            translateY.value = withSpring(0, SPRING_CONFIG);
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220 });
        }
    }, [open]);

    // Handle drag exclusively on the handle area or top of the sheet
    const pan = Gesture.Pan()
        // Only activate gesture when pulling DOWNWARDS past 15px
        .activeOffsetY([15, 500])
        .failOffsetX([-20, 20])
        .onBegin(() => {
            context.value = translateY.value;
        })
        .onChange((event) => {
            // Prevent dragging the sheet ABOVE its snap point (0)
            translateY.value = Math.max(0, context.value + event.translationY);
        })
        .onEnd((event) => {
            // Safer dismiss check: requires 40% height pull down OR strong downward velocity (>800)
            if (translateY.value > SHEET_HEIGHT * 0.4 || event.velocityY > 800) {
                performClose();
            } else {
                translateY.value = withSpring(0, SPRING_CONFIG);
            }
        });

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateY.value,
            [0, SHEET_HEIGHT],
            [0.5, 0],
            Extrapolation.CLAMP
        ),
        pointerEvents: translateY.value >= SCREEN_HEIGHT ? 'none' : 'auto',
    }));

    return (
        <>
            {/* Backdrop */}
            <Animated.View
                className="absolute inset-0 bg-black z-[1000]"
                style={backdropStyle}
            >
                <Pressable className="flex-1" onPress={() => performClose()} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                className={`absolute bottom-0 left-0 right-0 rounded-t-[32px] z-[1001] shadow-black/10 ${className}`}
                style={[
                    sheetStyle,
                    {
                        height: SHEET_HEIGHT,
                        elevation: 20,
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                    }
                ]}
            >
                {/* Dedicated Drag Handle Zone */}
                <GestureDetector gesture={pan}>
                    <View className="w-full py-4 items-center justify-center">
                        <View className={`w-12 h-1.5 bg-zinc-200 rounded-full ${closeClassName}`} />
                    </View>
                </GestureDetector>

                {/* Content Area - Free from Gesture Conflicts */}
                <View className="flex-1 px-5 pb-5">
                    {children}
                </View>
            </Animated.View>
        </>
    );
}