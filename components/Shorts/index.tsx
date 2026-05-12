// Copyright (c) 2026 Raj 
// See LICENSE for detail

import FeedItem from "@/components/Shorts/FeedItem";
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShortContextProvider from "../context/shorts";

export default function index() {
    const [containerHeight, setContainerHeight] = React.useState(0);

    const [activeIndex, setActiveIndex] = React.useState(0);

    const onViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 50 }).current;

    return (
        <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
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
                            data={Array.from({ length: 4 })}

                            showsVerticalScrollIndicator={false}
                            pagingEnabled={true}
                            snapToInterval={containerHeight}
                            snapToAlignment="start"
                            decelerationRate="fast"

                            onViewableItemsChanged={onViewableItemsChanged}
                            viewabilityConfig={viewabilityConfig}

                            renderItem={({ index }) => (
                                <FeedItem
                                    containerHeight={containerHeight}
                                    isActive={index === activeIndex}
                                />
                            )}
                        />
                    )}
                </View>
            </ShortContextProvider>
        </SafeAreaView>
    );
}