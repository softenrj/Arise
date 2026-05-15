// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { getAllMusics } from '@/service/database'; // Adjust path if needed
import { IMusicTrack } from '@/types/database';
import { useSQLiteContext } from 'expo-sqlite';
import { EllipsisVertical, Music, Music2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { ScanState } from '.';

export default function Musics({ scanState }: { scanState: ScanState }) {
    const db = useSQLiteContext();
    const [musics, setMusics] = useState<IMusicTrack[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMusicData();
    }, [scanState]);

    const loadMusicData = async () => {
        try {
            const data = await getAllMusics(db);
            setMusics(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const cleanFilename = (filename: string) => {
        if (!filename) return "Unknown Track";
        return filename.replace(/\.[^/.]+$/, "");
    };

    const renderTrack = ({ item }: { item: IMusicTrack }) => (
        <View className='flex-row items-center w-full gap-3'>

            {item.customCoverUri ? (
                <Image
                    source={{ uri: item.customCoverUri }}
                    className='w-16 h-16 rounded-sm bg-slate-100'
                />
            ) : (
                <View className='w-16 h-16 rounded-sm bg-slate-100 items-center justify-center'>
                    <Music size={24} color="#A1A1AA" />
                </View>
            )}

            <View className='flex-1 flex-col justify-center'>
                <Text
                    numberOfLines={1}
                    className='text-black text-sm font-jakarta tracking-tight'
                    style={{ fontWeight: 500 }}
                >
                    {cleanFilename(item.filename)}
                </Text>

                <Text numberOfLines={1} className='text-zinc-500 text-xs mt-0.5'>
                    {formatDuration(item.duration)} • Local Audio
                </Text>
            </View>

            <Pressable className='p-2 active:bg-slate-100 rounded-full'>
                <EllipsisVertical size={18} color='#d4d4d8' />
            </Pressable>
        </View>
    );

    return (
        <View className="flex-1">
            <View className='flex-row items-center mb-4 mx-2 gap-3'>
                <Music2 size={18} color="#000" />
                <Text className='text-xl text-black font-elms-med'>Scanned Music</Text>

                <View className="bg-slate-50 px-3 py-1.5 absolute right-0 rounded-full border border-slate-100">
                    <Text className="text-xs font-elms-med text-slate-500 tracking-wide">{musics.length}</Text>
                </View>
            </View>

            <FlatList
                data={musics}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={renderTrack}
                contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="py-10 items-center justify-center">
                            <Text className="text-zinc-500 font-elms">No music scanned yet.</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}