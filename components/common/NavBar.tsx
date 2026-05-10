// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppDrawer } from '@/hooks/useAppDrawer';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';


export default function NavBar() {
    const { onOpen } = useAppDrawer();
    const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    return (
        <SafeAreaView className="bg-white mt-2 z-10">
            <View className="flex px-6 pb-3 bg-white shadow-sm">

                <View className="flex-row justify-between items-center">
                    <View className='flex-row gap-3 items-center'>
                        <TouchableOpacity onPress={(onOpen)}>
                            <Avatar size="md">
                                <AvatarFallbackText>Raj</AvatarFallbackText>
                                <AvatarImage
                                    source={{
                                        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQsIKyVHCLjg95THmDo9ePbUjZtcHH_t0Jqg&s',
                                    }}
                                />
                            </Avatar>
                        </TouchableOpacity>

                        <View className="flex flex-col justify-center">
                            <Text className="text-xs font-elms text-gray-400 mb-0.5">
                                Good morning,
                            </Text>
                            <Text className="text-lg font-elms-med text-gray-900 leading-none tracking-tight">
                                Raj
                            </Text>
                        </View>
                    </View>

                    <View className="bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <Text className="text-xs font-elms-med text-slate-500 tracking-wide">
                            {today}
                        </Text>
                    </View>
                </View>


            </View>
        </SafeAreaView>
    );
}