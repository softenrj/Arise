// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppDrawer } from '@/hooks/useAppDrawer';
import { useAppSelector } from '@/hooks/useRedux';
import { defaultAvtar } from '@/utils/constants';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';

export default function NavBar({ children, portal = null }: { children: React.ReactNode, portal?: React.ReactNode }) {
    const { onOpen } = useAppDrawer();
    const { avatar, name } = useAppSelector(state => state.userReducer);

    return (
        <SafeAreaView className="bg-white mt-2 z-10" edges={['top']}>
            <View className="flex px-6 pb-3 bg-white shadow-sm">
                <View className="flex-row  gap-3 items-center relative">
                    <TouchableOpacity onPress={(onOpen)}>
                        <Avatar size="md">
                            <AvatarFallbackText>{name}</AvatarFallbackText>
                            <AvatarImage
                                source={{
                                    uri: avatar || defaultAvtar,
                                }}
                            />
                        </Avatar>
                    </TouchableOpacity>



                    {children}

                </View>
            </View>
            {portal}
        </SafeAreaView>
    );
}

export function GreetSnippts() {
    const hour = new Date().getHours();
    const { name } = useAppSelector(state => state.userReducer);

    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";

    return (
        <View className="flex flex-col justify-center">
            <Text className="text-xs font-elms text-gray-400 mb-0.5">
                {greeting},
            </Text>

            <Text className="text-lg font-elms-med text-gray-900 leading-none tracking-tight">
                {name}
            </Text>
        </View>
    );
}
export function TimeSnippts() {
    const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
    return <View className="bg-slate-50 px-3 py-1.5 absolute right-0 rounded-full border border-slate-100">
        <Text className="text-xs font-elms-med text-slate-500 tracking-wide">
            {today}
        </Text>
    </View>
}

export function ChipSnippts({ text }: { text: string }) {
    return <View className="bg-slate-50 px-3 py-1.5 absolute right-0 rounded-full border border-slate-100">
        <Text className="text-xs font-elms-med text-slate-500 tracking-wide">
            {text}
        </Text>
    </View>
}