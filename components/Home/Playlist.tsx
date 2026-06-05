// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { formatDurationLocalString } from '@/service/MusicDuration';
import { defaultPlayListCover } from '@/utils/constants';
import React from 'react';
import { Image, Text, View } from 'react-native';

export default function Playlist() {
    const { playlist } = useMusic();

    if (!playlist) return null;
    return (
        <View className='w-full'>

            <View
                className='overflow-hidden'
                style={{
                    flex: 1,
                    borderRadius: 14,
                    shadowColor: '#000',
                    shadowOpacity: 0.02,
                    shadowRadius: 4,
                    elevation: 6,
                    backgroundColor: '#fff',
                }}>
                <Image
                    source={{ uri: playlist?.cover || defaultPlayListCover }}
                    className='w-full'
                    style={{ aspectRatio: 1 }}
                />
            </View>

            <View className='px-1 mt-2'>
                <Text className='text-black text-2xl font-elms-med tracking-tighter'>
                    {playlist?.title}
                </Text>
                <Text className='text-zinc-400 text-sm font-elms mt-0.5'>
                    {playlist?.numberOfSongs} songs • {formatDurationLocalString(playlist?.totalSeconds || 0)}
                </Text>
            </View>

        </View>
    );
}