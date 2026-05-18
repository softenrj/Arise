// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { FlashList } from '@shopify/flash-list';
import { ArrowUpDown, LayoutGrid, LayoutList } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import LibraryCard from './LibraryCard';

export default function Library() {
    const [isList, setIsList] = React.useState(false);
    const toggle = React.useCallback(() => setIsList(prev => !prev), []);

    return (
        <View className='flex-1 bg-white '>
            <View className='flex-row justify-between items-center pb-4 px-1'>
                <Pressable className='flex-row items-center gap-1.5' hitSlop={8}>
                    <ArrowUpDown size={14} color='#18181B' strokeWidth={2.5} />
                    <Text className='text-zinc-900 text-[13px] font-bold'>Recent</Text>
                </Pressable>
                <Pressable onPress={toggle} hitSlop={8}>
                    {isList
                        ? <LayoutGrid size={18} color='#18181B' />
                        : <LayoutList size={18} color='#18181B' />
                    }
                </Pressable>
            </View>

            <FlashList
                key={isList ? 'list' : 'grid'}
                data={Array.from({ length: 8 })}
                scrollEnabled={false}
                numColumns={isList ? 1 : 3}
                renderItem={() => <LibraryCard isGrid={!isList} />}
                contentContainerStyle={!isList ? { paddingHorizontal: 2 } : undefined}
            />
        </View>
    );
}