// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { EllipsisVertical, MoveRight } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';

export default function Shorts() {
    return (
        <View>
            <View className='flex-col items-start'>
                <View className='flex-row items-center gap-2 bg-sky-50 px-3 py-1 rounded-full self-start mb-2'>
                    <Image source={require("@/assets/arise/shorts.png")} className='w-3 h-3' />
                    <Text className='text-sky-500 text-xs font-elms-med tracking-widest uppercase'>Shorts</Text>
                </View>
                <Text className='text-black text-4xl font-elms-med tracking-tighter leading-none'>Catch a new vibe.</Text>
                <View className='flex-row items-center gap-1.5 mt-2'>
                    <View className='w-4 h-px bg-gray-300' />
                    <MoveRight size={11} color='#d1d5db' />
                </View>
            </View>

            <FlatList
                data={Array.from({ length: 4 })}
                scrollEnabled={false}
                numColumns={2}
                columnWrapperStyle={{ gap: 15 }}
                contentContainerStyle={{ gap: 15 }}
                className='mx-2 my-2'
                renderItem={() => (
                    <View style={{
                        flex: 1,
                        borderRadius: 14,
                        shadowColor: '#000',
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 6,
                        backgroundColor: '#fff',
                    }}>
                        <View style={{ borderRadius: 14, overflow: 'hidden' }}>
                            <ImageBackground
                                source={{ uri: "https://mikiki.ismcdn.jp/mwimgs/2/3/-/img_2376de839abfe22c91f4117a7100c41f641127.jpg" }}
                                style={{ width: '100%', aspectRatio: 2 / 3 }}
                            >
                                <LinearGradient
                                    colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)']}
                                    style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}
                                >
                                    <View className='flex-row items-center justify-end'>
                                        <EllipsisVertical size={18} color='#fff' />
                                    </View>

                                    <View className='flex-col gap-0.5'>
                                        <Text numberOfLines={2} className='text-white text-sm font-elms-med leading-tight'>
                                            Tada Koe Hitotsu - Rokudenashi
                                        </Text>
                                        <Text numberOfLines={1} className='text-white/60 text-xs font-elms'>
                                            ロクデナシ
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </ImageBackground>
                        </View>
                    </View>
                )}
            />
        </View>
    )
}