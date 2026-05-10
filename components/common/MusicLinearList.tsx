// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { MoveRight, Zap } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

export default function MusicLinearList({ title, subTitle, Icon = Zap }: { title: string, subTitle: string, Icon?: React.ElementType }) {
    return (
        <View>
            <View className='flex-col items-start'>
                <View className='flex-row items-center gap-2 bg-sky-50 px-3 py-1 rounded-full self-start mb-2'>
                    <Icon size={12} color='#0ea5e9' fill='#0ea5e9' strokeWidth={0} />
                    <Text className='text-sky-500 text-xs font-elms-med tracking-widest uppercase'>{title}</Text>
                </View>
                <Text className='text-black text-4xl font-elms-med tracking-tighter leading-none'>{subTitle}</Text>
                <View className='flex-row items-center gap-1.5 mt-2'>
                    <View className='w-4 h-px bg-gray-300' />
                    <MoveRight size={11} color='#d1d5db' />
                </View>
            </View>

            <ScrollView horizontal contentContainerStyle={{ gap: 6 }} className='my-2' showsHorizontalScrollIndicator={false}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <View key={i} className='w-36'>

                        <Image
                            source={{ uri: "https://i1.sndcdn.com/artworks-TxxgGadkRxbMvkJ8-vKrXig-t500x500.jpg" }}
                            className='w-[8.5rem] h-[8.5rem]'
                        />

                        <View className='items-center'>
                            <Text numberOfLines={1} className='text-black text-sm font-jakarta mt-2.5 tracking-tight'>
                                Rokudenashi
                            </Text>

                            <Text numberOfLines={1} className='text-zinc-500 text-xs font-normal mt-1'>
                                琳琪玥雪
                            </Text>
                        </View>

                    </View>
                ))}
            </ScrollView>
        </View>
    )
}
