// Copyright (c) 2026 Raj
// See LICENSE for details.

import React, { ReactNode, useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedKeyboard,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  position?: "top" | "middle" | "bottom";
  children: ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  position = "middle",
  children,
}) => {
  const progress = useSharedValue<number>(0);
  const keyboard = useAnimatedKeyboard();

  const positionClasses = {
    top: "justify-start pt-24",
    middle: "justify-center",
    bottom: "justify-end pb-12",
  };

  useEffect(() => {
    if (isVisible) {
      progress.value = withTiming(1);
    } else {
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.6,
    pointerEvents: progress.value === 0 ? "none" : "auto",
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [0.9, 1],
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: -keyboard.height.value * 0.8,
      },
    ],
    pointerEvents: progress.value === 0 ? "none" : "auto",
  }));

  return (
    <View className="absolute inset-0 z-50" pointerEvents="box-none">
      <Animated.View
        className="absolute inset-0 bg-black"
        style={backdropStyle}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      <View
        className={`flex-1 px-5 ${positionClasses[position]}`}
        pointerEvents="box-none"
      >
        <Animated.View
          className="bg-white rounded-3xl p-6 shadow-2xl w-full"
          style={modalStyle}
        >
          {children}
        </Animated.View>
      </View>
    </View>
  );
};

export default CustomModal;
