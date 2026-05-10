import React from 'react';
import { Image, Text, View } from 'react-native';

export default function Playlist() {
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
                    source={{ uri: "https://thewildcattribune.com/wp-content/uploads/2023/05/52890928681_a467a529c4_o-e1685030922246.jpg" }}
                    className='w-full'
                    style={{ aspectRatio: 1 }}
                />
            </View>

            <View className='px-1 mt-2'>
                <Text className='text-black text-2xl font-elms-med tracking-tighter'>
                    Anime Chill Mix
                </Text>
                <Text className='text-zinc-400 text-sm font-elms mt-0.5'>
                    42 songs • 2h 38m
                </Text>
            </View>

        </View>
    );
}