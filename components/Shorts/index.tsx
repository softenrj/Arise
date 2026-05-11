// Copyright (c) 2026 Raj 
// See LICENSE for detail

import FeedItem from "@/components/Shorts/FeedItem";
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function index() {
    const [containerHeight, setContainerHeight] = useState(0);

    return (
        <SafeAreaView className='flex-1 bg-white'>
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
                        renderItem={() => <FeedItem containerHeight={containerHeight} />}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}