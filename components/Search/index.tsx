// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { NavBar } from '@/config/viewRegistry/navbar';
import Renderer from '@/renderer/renderer';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function index({ children }: { children: React.ReactNode }) {
    const navSeen = {
        ...NavBar['nav'],
        children: [
            { key: 'NavGreet' },
            { key: 'NavChip', props: { text: "Search" } }
        ]
    };
    return (
        <View className='flex-1 bg-white'>
            <Renderer scene={navSeen} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 10 }} className='flex-1 px-4 py-2 '>
                {children}
            </ScrollView>
        </View>
    )
}