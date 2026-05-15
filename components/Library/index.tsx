// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { NavBar } from '@/config/viewRegistry/navbar';
import Renderer from '@/renderer/renderer';
import React from 'react';
import { ScrollView, View } from 'react-native';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import Library from './Library';

export default function index() {
    const navSeen = {
        ...NavBar['nav'],
        children: [
            { key: 'NavGreet' },
            { key: 'NavChip', props: { text: "Library" } }
        ]
    };
    return (
        <View className='flex-1 bg-white'>
            <FocusAwareStatusBar style='dark' />
            <Renderer scene={navSeen} />
            <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 10 }} className='flex-1 px-6 py-2' showsVerticalScrollIndicator={false}>
                <Library />
            </ScrollView>
        </View>
    )
}