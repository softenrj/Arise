// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Asterisk, EllipsisVertical, MoveRight } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

export default function MusicoftheDay() {
    return (
        <View>
            <View className='flex-row items-start gap-3'>
                <View className='flex-col items-center gap-1 mt-1'>
                    <View className='w-0.5 h-8 bg-purple-500 rounded-full' />
                    <View className='w-0.5 h-3 bg-zinc-200 rounded-full' />
                </View>

                <View className='flex-col items-start flex-1'>
                    <View className='flex-row items-center gap-1.5 mb-2'>
                        <Asterisk size={10} color='#a855f7' fill='#a855f7' strokeWidth={0} />
                        <Text className='text-purple-500 text-xs font-elms-med tracking-widest uppercase'>Today's Vibe</Text>
                    </View>
                    <Text className='text-black text-4xl font-elms-med tracking-tighter leading-none'>
                        hand-picked,{'\n'}just for today.
                    </Text>
                    <View className='flex-row items-center gap-1.5 mt-3'>
                        <View className='w-4 h-px bg-zinc-200' />
                        <MoveRight size={11} color='#d4d4d8' />
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className='my-2 mx-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <View key={i} className='flex-row items-center w-full gap-3'>
                        <Image
                            source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh9ybGbX0RSnBFVlBeSOkzzlPi4O2eT5AH2w&s" }}
                            className='w-14 h-14 rounded-sm'
                        />

                        <View className='flex-1 flex-col justify-center'>
                            <Text numberOfLines={1} className='text-black text-sm font-jakarta tracking-tight' style={{ fontWeight: 500 }}>
                                Tada Koe Hitotsu - Rokudenashi 「ロクデナシ」[ Lyrics ] | Aru
                            </Text>
                            <Text numberOfLines={1} className='text-zinc-500 text-xs mt-0.5'>
                                琳琪玥雪
                            </Text>
                        </View>

                        <EllipsisVertical size={18} color='#d4d4d8' />
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}