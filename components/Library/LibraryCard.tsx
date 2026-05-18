// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useRouter } from 'expo-router';
import { EllipsisVertical } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';

interface LibraryCardProps {
    isGrid?: boolean;
}

export default function LibraryCard({ isGrid = false }: LibraryCardProps) {
    const opacity = useRef(new Animated.Value(1)).current;
    const router = useRouter();

    const pressIn = () => {
        Animated.timing(opacity, { toValue: 0.5, duration: 50, useNativeDriver: true }).start();
    }

    const pressOut = () => {
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        router.push('/(tabs)/playlist')
    }

    if (isGrid) {
        return (
            <Pressable onPressIn={pressIn} onPressOut={pressOut} className='flex-1 p-1.5'>
                <Animated.View style={{ opacity }}>
                    <Image
                        source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh9ybGbX0RSnBFVlBeSOkzzlPi4O2eT5AH2w&s' }}
                        className='w-full aspect-square'
                        resizeMode='cover'
                    />
                    <Text numberOfLines={1} className='text-zinc-900 text-[13px] font-bold mt-2.5 tracking-tight'>
                        Rokudenashi
                    </Text>
                    <Text numberOfLines={1} className='text-zinc-400 text-[11px] mt-0.5'>
                        Playlist
                    </Text>
                </Animated.View>
            </Pressable>
        );
    }

    return (
        <Pressable onPressIn={pressIn} onPressOut={pressOut}>
            <Animated.View style={{ opacity }} className='flex-row items-center gap-3 pb-3'>
                <Image
                    source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh9ybGbX0RSnBFVlBeSOkzzlPi4O2eT5AH2w&s' }}
                    className='w-[4.5rem] h-[4.5rem]'
                    resizeMode='cover'
                />
                <View className='flex-1 gap-1'>
                    <Text numberOfLines={1} className='text-zinc-900 text-lg font-elms-med tracking-tight'>
                        Rokudenashi
                    </Text>
                    <Text numberOfLines={1} className='text-zinc-400 text-[12px]'>
                        Playlist • 琳琪玥雪
                    </Text>
                </View>
                <Pressable hitSlop={14} onPress={() => { }}>
                    <EllipsisVertical size={18} color='#A1A1AA' />
                </Pressable>
            </Animated.View>
        </Pressable>
    );
}