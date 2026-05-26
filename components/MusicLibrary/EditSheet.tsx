import { useMusicLib } from '@/hooks/useMusicLib';
import { formatDuration } from '@/service/MusicDuration';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import React from 'react';
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import SheetProvider from '../ui/Sheet';

export default function EditSheet() {
    const { editSheet, closeSheet, musics, editMusicId } = useMusicLib();
    const [music, setMusic] = React.useState<IMusicTrack | null>(null)

    const handleSetMusic = React.useCallback(() => {
        const track = musics.find(m => m.id === editMusicId);
        if (track) setMusic(track)
    }, [editMusicId])

    React.useEffect(() => {
        handleSetMusic();
    }, [editMusicId])

    return (
        <SheetProvider open={editSheet} onClose={closeSheet}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                className='px-5 pt-2 pb-12'
                contentContainerStyle={{ paddingBottom: 48 }}
            >

                <Text className='text-2xl font-elms-bold'>Arise Edit</Text>

                <View className='my-4 flex-row gap-3'>
                    <TouchableOpacity>
                        <Pressable>
                            <Image
                                source={{ uri: music?.customCoverUri || defaultMusicArtWork }}
                                className='w-44 h-44 rounded-md bg-slate-100'
                                resizeMethod="resize"
                            />
                        </Pressable>
                    </TouchableOpacity>

                    <View className='gap-4'>
                        <View>
                            <Text className='text-sm font-elms text-gray-500 uppercase'>Title: </Text>
                            <Text className='ml-1 underline'>{music?.title}</Text>
                        </View>

                        <View>
                            <Text className='text-sm font-elms text-gray-500 uppercase'>Artist: </Text>
                            <Text className='ml-1 underline'>{music?.artist}</Text>
                        </View>

                        <View>
                            <Text className='text-sm font-elms text-gray-500 uppercase'>duration: </Text>
                            <Text className='ml-1'>{formatDuration(music?.duration || 0)}</Text>
                        </View>
                    </View>

                </View>

            </ScrollView>
        </SheetProvider>
    )
}