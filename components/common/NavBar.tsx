import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';

const categories = ['All', 'Recent', 'Recomended'];

export default function NavBar() {
    const [activeTab, setActiveTab] = React.useState('All');
    const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    return (
        <SafeAreaView edges={['top']} className="bg-white z-10">
            <View className="flex px-6 border-b border-gray-100 bg-white shadow-sm">

                <View className="flex-row justify-between items-center">
                    <View className='flex-row gap-3 items-center'>
                        <Avatar size="md">
                            <AvatarFallbackText>Raj</AvatarFallbackText>
                            <AvatarImage
                                source={{
                                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQsIKyVHCLjg95THmDo9ePbUjZtcHH_t0Jqg&s',
                                }}
                            />
                        </Avatar>

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

                <View className="py-2">
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
                                    className={`px-5 py-2 rounded-full border ${isActive
                                        ? 'bg-white border-gray-300' // High-contrast white
                                        : 'bg-[#27272A] border-transparent' // Slightly lighter gray for inactive
                                        }`}
                                >
                                    <Text
                                        className={`text-sm font-elms-med ${isActive ? 'text-black' : 'text-[#A1A1AA]' // Inactive text is muted gray
                                            }`}

                                    >
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}