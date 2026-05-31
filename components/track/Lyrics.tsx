// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { LyricLine, LyricsService } from '@/service/lyrics';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

export default function Lyrics({ color }: { color: string }) {
    const [lyrics, setLyrics] = React.useState<LyricLine[]>([]);

    const pickDocuments = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["text/plain", "*/*"],
                copyToCacheDirectory: true
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const pickedFile = result.assets[0];

            const isLrcExtension = pickedFile.name.toLowerCase().endsWith('.lrc') ||
                pickedFile.uri.toLowerCase().endsWith('.lrc');

            if (!isLrcExtension) {
                alert("Authentication Failed: You must select a valid .lrc file format.");
                return;
            }

            const lyrics = await LyricsService.loadLyricsFromFile(pickedFile.uri)
            console.log(lyrics)

            setLyrics(lyrics)

        } catch (error) {
            console.log("Error picking documents:", error);
        }
    };

    return (
        <View
            className='w-full p-5 rounded-2xl'
            style={{ backgroundColor: color, overflow: 'hidden' }}
        >

            <LinearGradient
                colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.15)', 'transparent']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className='absolute inset-0'
            />

            <Text className="text-white font-bold text-lg z-10">Lyrics</Text>

            <View className='py-4 gap-4 max-h-[300px] overflow-hidden'>
                <Text className='text-white font-elms-bold text-2xl'>Now I'm Mr. Charisma, fucking Pablo Escobar (Escobar)</Text>
                <Text className='text-white font-elms-bold text-2xl'>Now I'm Mr. Charisma, fucking Pablo Escobar (Escobar)</Text>
                <Text className='text-white font-elms-bold text-2xl'>Now I'm Mr. Charisma, fucking Pablo Escobar (Escobar)</Text>
                <Text className='text-white font-elms-bold text-2xl'>Now I'm Mr. Charisma, fucking Pablo Escobar (Escobar)</Text>
                <Text className='text-white font-elms-bold text-2xl'>Now I'm Mr. Charisma, fucking Pablo Escobar (Escobar)</Text>
                <Text className='text-white font-elms-bold text-2xl'>Now I'm Mr. Charisma, fucking Pablo Escobar (Escobar)</Text>
                <Text className='text-white font-elms-bold text-2xl'>Now I'm Mr. Charisma, fucking Pablo Escobar (Escobar)</Text>
            </View>

            <Pressable className='px-2 py-1.5 bg-white w-[7.5rem] justify-center items-center rounded-full'>
                <TouchableOpacity onPress={pickDocuments}>
                    <Text className='text-black font-elms-bold'>Show Lyrics</Text>
                </TouchableOpacity>
            </Pressable>
        </View>
    );
}