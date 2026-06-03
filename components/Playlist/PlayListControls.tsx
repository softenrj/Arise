// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { usePlaylist } from '@/hooks/usePlaylist';
import { useAppDispatch } from '@/hooks/useRedux';
import { formatDurationLocalString } from '@/service/MusicDuration';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { setupQueue } from '@/store/reducer/trackplayerSlice';
import { defaultPlayList, defaultPlayListCover } from '@/utils/constants';
import { Dot, Music, Play } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import PlaylistMenu from './playlistMenu';


export default function PlayListControls({ onMusicListOpen, onEditPlayList, onRemovePlaylist }: { onMusicListOpen: () => void, onEditPlayList: () => void, onRemovePlaylist: () => void }) {
    const { playlistMusics, playlist } = usePlaylist();
    const [duration, setDuration] = React.useState<string>('0 second');
    const dispatch = useAppDispatch();

    const streamPlayList = () => {
        dispatch(setupQueue({ tracks: getTrackFromMusic(playlistMusics), playlistName: playlist?.title || defaultPlayList }));
    }

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

                    <PlaylistMenu onMusicListOpen={onMusicListOpen} onEditPlayList={onEditPlayList} onRemovePlaylist={onRemovePlaylist} />
                </View>

                <TouchableOpacity className='bg-green-500 p-4 rounded-full' onPress={streamPlayList}>
                    <Play size={20} fill={'black'} />
                </TouchableOpacity>
            </View>
        </View>
    )
}