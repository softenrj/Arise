// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { useAppDispatch } from '@/hooks/useRedux';
import { formatDuration } from '@/service/MusicDuration';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { setupQueue } from '@/store/reducer/trackplayerSlice';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { Music2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { ScanState } from '.';
import MusicMenu from './MusicMenu';

export default function Musics({ scanState }: { scanState: ScanState }) {
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useAppDispatch();

    const { musics, onMusicRefresh } = useMusic();

    const playTrack = async (idx: number) => {
        try {
            dispatch(setupQueue({ tracks: getTrackFromMusic(musics), startIndex: idx }))

        } catch (error) {
            console.error('Failed to set track globally:', error);
        }
    }

    useEffect(() => {
        onMusicRefresh();
    }, [scanState]);


    const cleanFilename = (filename: string) => {
        if (!filename) return "Unknown Track";
        return filename.replace(/\.[^/.]+$/, "");
    };

    const renderTrack = ({ item, index }: { item: IMusicTrack, index: number }) => (
        <View className='flex-row items-center w-full gap-3 pr-2' key={index}>

            <Pressable
                onPress={() => playTrack(index)}
                className='flex-1 flex-row items-center gap-3'
            >
                <Image
                    source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                    className='w-16 h-16 rounded-sm bg-slate-100'
                    resizeMethod="resize"
                />

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
            </Pressable>

            <View>
                <MusicMenu musicId={item.id} />
            </View>

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
                extraData={musics}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={renderTrack}
                contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
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