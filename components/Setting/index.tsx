import { useRouter } from 'expo-router';
import { ArrowLeft, Cog } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';

export default function index() {
    const router = useRouter();

    return (
        <View className='flex-1 bg-white'>
            <FocusAwareStatusBar style='dark' />
            <SafeAreaView className='flex-1' edges={['top']}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 10 }} className='flex-1 px-4 py-2 '>
                    <View className='flex-row items-center justify-between'>
                        <Pressable onPress={() => router.back()}>
                            <ArrowLeft size={18} />
                        </Pressable>
                        <Text className='text-xl font-elms-med text-black'>Account & Settings</Text>
                        <Cog size={18} />
                    </View>


                </ScrollView>
            </SafeAreaView>
        </View>
    )
}