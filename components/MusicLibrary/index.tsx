// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRefresh } from '@/hooks/useRefresh';
import { useRouter } from 'expo-router';
import { ArrowLeft, Music2 } from 'lucide-react-native';
import React from 'react';
import { Animated, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddToPlayList from '../common/AddToPlayList';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import MiniPlayer from '../common/MiniPlayer';
import MusicLibProvider from '../context/musicLib';
import EditSheet from './EditSheet';
import Musics from './Musics';
import ScanMusic from './ScanMusic';

export type ScanState = 'idle' | 'scanning' | 'done' | 'error';


export default function MusicScanScreen() {
    const [scanState, setScanState] = React.useState<ScanState>('idle');
    const router = useRouter();

    const { onRefresh, refresh } = useRefresh();

    const handleState = (action: ScanState) => setScanState(action);
    const [targetMusicId, setTargetMusicId] = React.useState<string | null>(null);
    const [openAddtoPlaylist, setOpenAddtoPlaylist] = React.useState(false);

    const handleOpenAddToPlayList = (musicId: string) => {
        setTargetMusicId(musicId);
        setOpenAddtoPlaylist(true);
    }

    const handleOnCloseAddToPlayList = React.useCallback(() => {
        setOpenAddtoPlaylist(false);
        setTargetMusicId(null);
    }, []);

    return (
        <MusicLibProvider>
            <View className="flex-1 bg-white">
                <FocusAwareStatusBar style="dark" />
                <SafeAreaView className="flex-1" edges={['top']}>
                    <Animated.View className="flex-1">

                        <View className="flex-row items-center justify-between px-5 py-3.5 border-b-[0.5px] border-slate-200">
                            <Pressable className="w-9 h-9 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100" hitSlop={12} onPress={() => router.back()}>
                                <ArrowLeft size={18} color="#64748B" />
                            </Pressable>
                            <Text className="text-slate-900 text-[15px] font-elms-med tracking-[0.3px]">Music Library</Text>
                            <Pressable className="w-9 h-9 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100" hitSlop={12}>
                                <Music2 size={18} color="#64748B" />
                            </Pressable>
                        </View>

                        <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 60 }} className='flex-1 px-6 py-2' showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}>
                            <ScanMusic scanState={scanState} setScanState={handleState} />
                            <Musics scanState={scanState} onOpenAddToPlayList={handleOpenAddToPlayList} />
                        </ScrollView>
                    </Animated.View>
                </SafeAreaView>
            </View>
            <MiniPlayer />
            <EditSheet />
            {targetMusicId && <AddToPlayList musicId={targetMusicId} isVisible={openAddtoPlaylist} onClose={handleOnCloseAddToPlayList} />}
        </MusicLibProvider>
    );
}