// Copyright (c) 2026 Raj 
// See LICENSE for detail

import FeedItem from "@/components/Shorts/FeedItem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMusic } from "@/hooks/useMusic";
import { useAppSelector } from "@/hooks/useRedux";
import { useRefresh } from "@/hooks/useRefresh";
import { useTrack } from "@/hooks/useTrack";
import { getTrackFromMusic } from "@/service/TrackMaker";
import { AriseTrack } from "@/types/database";
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { RefreshControl, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme } from "../context/apptheme";
import ShortContextProvider from "../context/shorts";

export default function index() {
    const [containerHeight, setContainerHeight] = React.useState(0);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const { setTheme } = useAppTheme();
    const { musics } = useMusic();
    const { refresh, onRefresh } = useRefresh();
    const { queue, sourceType } = useAppSelector(state => state.trackReducer);
    const { playAtIndex, onCycleLoopMode, setTrackVolume, setupQueue } = useTrack();


    const onViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            playAtIndex(viewableItems[0].index);
            setActiveIndex(viewableItems[0].index);
        }
    }, []);

    useFocusEffect(React.useCallback(() => {
        onCycleLoopMode('track')
        setTheme(AppTheme.dark);

        return () => {
            setTheme(AppTheme.light);
            onCycleLoopMode('none');
            setTrackVolume(1);
        };
    }, []));

    const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 50 }).current;

    const renderItem = React.useCallback(
        ({ index, item }: { index: number, item: AriseTrack }) => (
            <FeedItem
                containerHeight={containerHeight}
                isActive={index === activeIndex}
                feed={item}
            />
        ),
        [containerHeight, activeIndex]
    );

    React.useEffect(() => {
        if (queue.length === 0 && sourceType === 'start') {
            setupQueue({ tracks: getTrackFromMusic(musics), playlistName: 'default', sourceType: 'start', sourceId: null, play: true });
        }
    }, [queue])

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <SafeAreaView edges={['top']} className="flex-1">
                <ShortContextProvider>
                    <View
                        className='flex-1 bg-black'
                        onLayout={(event) => {
                            const { height } = event.nativeEvent.layout;
                            setContainerHeight(height);
                        }}
                    >
                        {containerHeight > 0 && (
                            <FlashList
                                data={queue}

                                showsVerticalScrollIndicator={false}
                                pagingEnabled={true}
                                snapToInterval={containerHeight}
                                snapToAlignment="start"
                                decelerationRate="fast"

                                refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}

                                onViewableItemsChanged={onViewableItemsChanged}
                                viewabilityConfig={viewabilityConfig}

                                renderItem={renderItem}
                            />
                        )}
                    </View>
                </ShortContextProvider>
            </SafeAreaView>
        </View>
    );
}