// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Music, Music2 } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import PlayListMusicMenu from './PlayListMusicMenu';

export default function PlayListMusic() {


    const renderTrack = () => (
        <View className='flex-row items-center w-full gap-3'>

            <Pressable
                onPress={() => { }}
                className='flex-1 flex-row items-center gap-3'
            >
                {1 ? (
                    <Image
                        source={{ uri: "https://template.canva.com/EAGYFRbnbek/2/0/800w-fOdQ6rP7qsA.jpg" }}
                        className='w-16 h-16 rounded-sm bg-slate-100'
                        resizeMethod="resize"
                    />
                ) : (
                    <View className='w-16 h-16 rounded-sm bg-slate-100 items-center justify-center'>
                        <Music size={24} color="#A1A1AA" />
                    </View>
                )}

                <View className='flex-1 flex-col justify-center'>
                    <Text
                        numberOfLines={1}
                        className='text-white text-sm font-jakarta tracking-tight'
                        style={{ fontWeight: 500 }}
                    >
                        Alex Warren - Ordinary
                    </Text>

                    <Text numberOfLines={1} className='text-zinc-500 text-xs mt-0.5'>
                        Alex Warren - Ordinary Alex Warren - Ordinary Alex Warren - Ordinary Alex Warren - Ordinary
                    </Text>
                </View>
            </Pressable>

            <View>
                <PlayListMusicMenu />
            </View>

        </View>
    );

    return (
        <View className="flex-1">
            <View className='flex-row items-center mb-4 mx-2 gap-3'>
                <Music2 size={18} color="#ffff" />
                <Text className='text-xl text-white font-elms-med'>Scanned Music</Text>

                <View className="bg-slate-50 px-3 py-1.5 absolute right-0 rounded-full border border-slate-100">
                    <Text className="text-xs font-elms-med text-slate-500 tracking-wide">{12}</Text>
                </View>
            </View>

            <FlatList
                data={Array.from({ length: 10 })}
                scrollEnabled={false}
                renderItem={renderTrack}
                contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
            />
        </View>
    );
}