// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { usePlaylist } from '@/hooks/usePlaylist';
import { formatDurationLocalString } from '@/service/MusicDuration';
import { defaultPlayListCover } from '@/utils/constants';
import { Dot, EllipsisVertical, Music, Play } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';


export default function PlayListControls() {
    const { playlistMusics, playlist } = usePlaylist();
    const [duration, setDuration] = React.useState<string>('0 second')

    React.useEffect(() => {
        const totalDuration = playlistMusics.reduce(
            (sum, music) => sum + (music.duration ?? 0),
            0
        );

        setDuration(formatDurationLocalString(totalDuration));
    }, [playlistMusics]);

    return (
        <View className='mx-6 my-4'>

            <View className='flex-row gap-2 -mt-4 mb-2 items-center'>
                <Music size={14} color={'white'} />
                <Text className='text-gray-300'>{playlistMusics.length}</Text>

                <Dot size={18} color={'white'} />
                <Text className='text-gray-400'>{duration}</Text>
            </View>

            <View className='flex-row flex-1 w-full justify-between'>
                <View className='flex-row items-center gap-4'>
                    <View className=' flex-row gap-1'>
                        <View className='h-14 w-10 border-[3px] rounded-md border-white'>
                            <Image source={{ uri: playlist?.cover || defaultPlayListCover }} resizeMode='cover' className='h-full w-full' />
                        </View>
                        <View className='justify-center items-center gap-1 w-20'>
                            <View className='flex-row items-center gap-3'>
                                <Play size={12} fill={'white'} />
                                <Text className='text-white'>Play</Text>
                            </View>
                            <Text numberOfLines={1} className='text-sm pl-1 whitespace-nowrap font-elms text-gray-400'>in Shots</Text>
                        </View>
                    </View>

                    <Pressable>
                        <TouchableOpacity className='flex-row items-center gap-2'>
                            <EllipsisVertical size={12} color={'white'} />
                            <Text className='text-white text-sm font-elms'>Options</Text>
                        </TouchableOpacity>
                    </Pressable>
                </View>

                <View className='bg-green-500 p-4 rounded-full'>
                    <Play size={20} fill={'black'} />
                </View>
            </View>
        </View>
    )
}