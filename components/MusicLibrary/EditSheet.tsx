// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { useMusicLib } from '@/hooks/useMusicLib';
import { updateMusicdb } from '@/service/database';
import { createOrUpdateLyrics } from '@/service/lyricsdb';
import { extractVideoId } from '@/service/MusicDuration';
import { saveLyrics, saveMedia } from '@/service/persistMedia';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FileArchive } from 'lucide-react-native';
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import SheetProvider from '../ui/Sheet';

export default function EditSheet() {
    const db = useSQLiteContext();
    const { musics, onMusicUpdate } = useMusic();
    const { editSheet, closeSheet, editMusicId } = useMusicLib();
    const [music, setMusic] = React.useState<IMusicTrack | null>(null);

    // ------------------ Edit fields ----------------
    const [title, setTitle] = React.useState('');
    const [artist, setArtist] = React.useState('');
    const [lyrics, setLyrics] = React.useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [customeImage, setCustomeImage] = React.useState<string | null>(null);
    const [customeVideo, setCustomeVideo] = React.useState<string | null>(null);
    const [customVideoFileName, setCustomVideoFileName] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [youtubeUrl, setYoutubeUrl] = React.useState<string>('');

    const player = useVideoPlayer(music?.customVideoUri ?? null, (p) => {
        p.loop = true;
        p.volume = 1.0;
        p.muted = false;
        p.timeUpdateEventInterval = 0.25;
    });


    const handlePickLytics = React.useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["text/plain", "*/*"],
                multiple: false,
                copyToCacheDirectory: true
            })

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const pickedFile = result.assets[0];
            setLyrics(pickedFile);
        } catch (error) {
            console.log("Error picking documents:", error);
        }
    }, [editMusicId])

    const handleImagePicker = React.useCallback(async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ['images'],
                quality: 1
            })

            if (result.canceled || !result.assets || result.assets.length === 0) return;
            const pickedFile = result.assets[0];

            setCustomeImage(pickedFile.uri);

        } catch (error) {
            console.log("Error picking documents:", error);
        }
    }, [editMusicId])

    const handleVideoPicker = React.useCallback(async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ['videos'],
                quality: 1
            })

            if (result.canceled || !result.assets || result.assets.length === 0) return;
            const pickedFile = result.assets[0];
            player.replace(pickedFile.uri);
            setCustomeVideo(pickedFile.uri);
            setCustomVideoFileName(pickedFile.fileName ?? null);

        } catch (error) {
            console.log("Error picking documents:", error);
        }
    }, [editMusicId])

    React.useEffect(() => {
        const track = musics.find(m => m.id === editMusicId);
        if (track) {
            setMusic(track);
            setTitle(track.title!);
            setArtist(track.artist);
            if (track.customVideoUri && track.customVideoFileName) {
                player.replace(track?.customVideoUri);
                setCustomVideoFileName(track.customVideoFileName)
            }
            if (track.youtube_uri) {
                setYoutubeUrl(track.youtube_uri)
            }
        }
    }, [editMusicId, musics]);

    const handleSave = async () => {
        try {
            if (!music) return;
            setLoading(true);
            let lyricsId = null;

            if (lyrics) {
                const lyricsUri = await saveLyrics(
                    lyrics.uri,
                    music.id
                );

                const lyricsObject = {
                    ...lyrics,
                    uri: lyricsUri,
                    musicId: music.id,
                };

                lyricsId = await createOrUpdateLyrics(
                    lyricsObject,
                    db
                );
            }

            let imageMediaUri = null;
            let videoMediaUri = null;

            if (customeImage) imageMediaUri = await saveMedia(customeImage, 'image', music.id);
            if (customeVideo) videoMediaUri = await saveMedia(customeVideo, 'video', music.id)


            const updatedMusic = await updateMusicdb(db, music?.id!, {
                title, artist, lyricsId, customCoverUri: imageMediaUri, customVideoUri: videoMediaUri, customVideoFileName, youtube_uri: extractVideoId(youtubeUrl) ?? null
            }) as IMusicTrack;

            if (updatedMusic) {
                setTitle('');
                setArtist('');
                setLyrics(null);
                setCustomeImage(null);
                setCustomeVideo(null);
                setCustomVideoFileName(null);
                onMusicUpdate(updatedMusic);
                setYoutubeUrl('');
                closeSheet();
            }
        } catch (error) {
            console.log("Error saving music:", error);
        } finally {
            setLoading(false);
        }
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
                        onPress={handleImagePicker}
                    >
                        <Image
                            source={{ uri: customeImage || music?.customCoverUri || defaultMusicArtWork }}
                            className='w-full h-64'
                            resizeMode="cover"
                            style={{ aspectRatio: 1 / 1 }}
                        />
                    </TouchableOpacity>
                </View>

                <View className='gap-5'>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

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
                    </KeyboardAvoidingView>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
                    </KeyboardAvoidingView>

                    <View>
                        <Text className='text-xs font-elms text-slate-500 uppercase mb-1 ml-1 tracking-wider'>
                            Youtube Video
                        </Text>
                        <TextInput
                            value={youtubeUrl}
                            onChangeText={setYoutubeUrl}
                            placeholder="Enter youtube url"
                            placeholderTextColor="#94a3b8"
                            className='bg-slate-100 px-4 py-3 rounded-xl text-base font-elms text-slate-900'
                        />
                        {youtubeUrl ? <YouTubeEmbed id={extractVideoId(youtubeUrl) ?? ''} /> : null}
                    </View>

                    <View>
                        <Text className='text-xs font-elms text-slate-500 uppercase mb-1 ml-1 tracking-wider'>
                            Lyrics
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className='bg-slate-100 px-4 py-4 rounded-xl flex-row justify-between items-center'
                            onPress={handlePickLytics}
                        >
                            <Text className='text-sm font-elms text-slate-500 break-words max-w-[90%]'>
                                {lyrics?.name ? lyrics.name : 'Select .lrc file...'}
                            </Text>
                            <FileArchive size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <View className='gap-5'>
                        <Text className='text-xs font-elms text-black uppercase tracking-wider'>
                            Short Clip
                        </Text>
                        {(music?.customVideoUri || customeVideo) ? (
                            <View className='w-full h-48 rounded-xl overflow-hidden bg-slate-200'>
                                <VideoView
                                    style={{ width: '100%', height: '100%' }}
                                    player={player}
                                    allowsPictureInPicture
                                    contentFit="cover"
                                />
                            </View>
                        ) : null}

                        <TouchableOpacity
                            activeOpacity={0.7}
                            className='bg-slate-100 px-4 py-4 rounded-xl flex-row justify-between items-center'
                            onPress={handleVideoPicker}
                        >
                            <Text className='text-base font-elms text-slate-500'>
                                {customVideoFileName ? customVideoFileName : 'Select Clip yet...'}
                            </Text>
                            <FileArchive size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>


                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSave}
                    className='mt-8 bg-slate-900 py-4 rounded-xl items-center shadow-sm'
                    disabled={loading}
                >
                    <Text className='text-white text-lg font-elms-bold'>Save Changes</Text>
                </TouchableOpacity>

            </ScrollView>
        </SheetProvider>
    );
}