import { usePlaylist } from '@/hooks/usePlaylist';
import { reorderPlaylistMusic } from '@/service/playlistdb';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import PlayListMusicMenu from './PlayListMusicMenu';

const initialData = Array.from({ length: 10 }).map((_, index) => ({
    id: `track-${index}`,
    title: `Alex Warren - Ordinary`,
}));

export default function PlayListMusic({ header }: { header: React.JSX.Element }) {
    const db = useSQLiteContext();
    const { playlistMusics, setPlayListMusic } = usePlaylist();

    const handleReorder = async (data: any) => {
        await reorderPlaylistMusic({ db, items: data });
        setPlayListMusic(data);
    }


    const renderTrack = ({ item, drag, isActive }: any) => (
        <ScaleDecorator>
            <View className={`flex-row items-center w-full gap-3 py-2 px-6 ${isActive ? 'opacity-70 bg-zinc-800' : ''}`}>
                <Pressable
                    onLongPress={drag}
                    disabled={isActive}
                    className='flex-1 flex-row items-center gap-3'
                >
                    <Image
                        source={{ uri: "https://template.canva.com/EAGYFRbnbek/2/0/800w-fOdQ6rP7qsA.jpg" }}
                        className='w-16 h-16 rounded-sm bg-slate-100'
                        resizeMethod="resize"
                    />

                    <View className='flex-1 flex-col justify-center'>
                        <Text
                            numberOfLines={1}
                            className='text-white text-sm font-jakarta tracking-tight'
                            style={{ fontWeight: '500' }}
                        >
                            {item.title}
                        </Text>
                        <Text numberOfLines={1} className='text-zinc-500 text-xs mt-0.5'>
                            Alex Warren - Ordinary
                        </Text>
                    </View>
                </Pressable>

                <View>
                    <PlayListMusicMenu />
                </View>
            </View>
        </ScaleDecorator>
    );

    return (
        <View className="flex-1">
            <DraggableFlatList
                data={playlistMusics}
                onDragEnd={({ data }) => handleReorder(data)}
                keyExtractor={(item) => item.id}
                renderItem={renderTrack}
                ListHeaderComponent={header}

                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}