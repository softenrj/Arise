// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { router } from 'expo-router';
import { ChevronDown, EllipsisVertical } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackSheet from './TrackSheet';

export default function index() {
    return (
        <TrackSheet open={true}>
            <SafeAreaView className='flex-row justify-between items-center'>
                <Pressable className="w-9 h-9 items-center justify-center rounded-xl bg-white/5" hitSlop={12} onPress={() => router.back()}>
                    <TouchableOpacity>
                        <ChevronDown size={28} color="#ffff" />
                    </TouchableOpacity>
                </Pressable>
                <Text className='text-white text-wrap text-md uppercase truncate font-elms' numberOfLines={1}>Playing from default</Text>
                <Pressable className="w-9 h-9 items-center justify-center rounded-xl bg-white/5" hitSlop={12} onPress={() => router.back()}>
                    <TouchableOpacity>
                        <EllipsisVertical size={16} color="#ffff" />
                    </TouchableOpacity>
                </Pressable>
            </SafeAreaView>
        </TrackSheet>
    )
}