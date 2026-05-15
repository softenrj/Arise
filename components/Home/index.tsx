// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { NavBar } from '@/config/viewRegistry/navbar';
import Renderer from '@/renderer/renderer';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';


const categories = ['All', 'Recent', 'Recomended'];

export default function index({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = React.useState('All');

    const navSeen = {
        ...NavBar['nav'],
        children: [
            { key: 'NavGreet' },
            { key: 'NavTime' }
        ]
    };

    return (
        <View className='bg-white flex-1'>
            <Renderer scene={navSeen} />
            <FocusAwareStatusBar style='dark' />
            <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 10 }} className='flex-1 px-4 py-2' showsVerticalScrollIndicator={false}>
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {categories.map((tab) => {
                            const isActive = activeTab === tab;

                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.7}
                                    className={`px-3 py-1.5 rounded-full border ${isActive
                                        ? 'bg-white border-gray-300'
                                        : 'bg-[#27272A] border-transparent'
                                        }`}
                                >
                                    <Text className={`text-sm font-elms-med ${isActive ? 'text-black' : 'text-[#A1A1AA]'}`}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {children}
            </ScrollView>
        </View>
    )
}