import { useMusicLib } from '@/hooks/useMusicLib';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FileArchive } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SheetProvider from '../ui/Sheet';

export default function EditSheet() {
    const { editSheet, closeSheet, musics, editMusicId } = useMusicLib();
    const [music, setMusic] = useState<IMusicTrack | null>(null);

    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');

    const player = useVideoPlayer(require('@/assets/video/sample1.mp4'), (p) => {
        p.loop = true;
        p.volume = 1.0;
        p.muted = false;
        p.timeUpdateEventInterval = 0.25;
    });

    useEffect(() => {
        const track = musics.find(m => m.id === editMusicId);
        if (track) {
            setMusic(track);
            setTitle(track.title!);
            setArtist(track.artist);
        }
    }, [editMusicId, musics]);

    const handleSave = () => {
        console.log("Saving...", { title, artist });
        // updateTrack({ ...music, title, artist });
        closeSheet();
    };

    return (
        <SheetProvider open={editSheet} onClose={closeSheet}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                className='px-5 pt-4 pb-12'
                contentContainerStyle={{ paddingBottom: 48 }}
            >

                <View className='mb-6 flex-row items-center justify-between'>
                    <Text className='text-2xl font-elms-bold text-slate-900'>Edit Track</Text>
                </View>

                <View className='items-center mb-8'>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className='relative rounded-2xl shadow-sm overflow-hidden bg-slate-100'
                    >
                        <Image
                            source={{ uri: music?.customCoverUri || defaultMusicArtWork }}
                            className='w-full h-64'
                            resizeMode="cover"
                            style={{ aspectRatio: 1 / 1 }}
                        />
                    </TouchableOpacity>
                </View>

                <View className='gap-5'>

                    <View>
                        <Text className='text-xs font-elms text-slate-500 uppercase mb-1 ml-1 tracking-wider'>
                            Title
                        </Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter song title"
                            placeholderTextColor="#94a3b8"
                            className='bg-slate-100 px-4 py-3 rounded-xl text-base font-elms text-slate-900'
                        />
                    </View>

                    <View>
                        <Text className='text-xs font-elms text-slate-500 uppercase mb-1 ml-1 tracking-wider'>
                            Artist
                        </Text>
                        <TextInput
                            value={artist}
                            onChangeText={setArtist}
                            placeholder="Enter artist name"
                            placeholderTextColor="#94a3b8"
                            className='bg-slate-100 px-4 py-3 rounded-xl text-base font-elms text-slate-900'
                        />
                    </View>

                    <View>
                        <Text className='text-xs font-elms text-slate-500 uppercase mb-1 ml-1 tracking-wider'>
                            Lyrics
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className='bg-slate-100 px-4 py-4 rounded-xl flex-row justify-between items-center'
                        >
                            <Text className='text-base font-elms text-slate-500'>
                                Select .lrc file...
                            </Text>
                            <FileArchive size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <View className='gap-5'>
                        <Text className='text-xs font-elms text-black uppercase tracking-wider'>
                            Short Clip
                        </Text>
                        <View className='w-full h-48 rounded-xl overflow-hidden bg-slate-200'>
                            <VideoView
                                style={{ width: '100%', height: '100%' }}
                                player={player}
                                allowsPictureInPicture
                                contentFit="cover"
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            className='bg-slate-100 px-4 py-4 rounded-xl flex-row justify-between items-center'
                        >
                            <Text className='text-base font-elms text-slate-500'>
                                Select Clip yet...
                            </Text>
                            <FileArchive size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSave}
                    className='mt-8 bg-slate-900 py-4 rounded-xl items-center shadow-sm'
                >
                    <Text className='text-white text-lg font-elms-bold'>Save Changes</Text>
                </TouchableOpacity>

            </ScrollView>
        </SheetProvider>
    );
}