// Copyright (c) 2026 Raj 
// See LICENSE for detail

import { Clock, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RECENT_SEARCHES = [
    'My Love', 'Blinding Lights', 'Starboy', 'Save Your Tears',
    'Die For You'
];

export default function SearchInput() {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);

    const results = RECENT_SEARCHES.filter(s =>
        query.length === 0 || s.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <View className="w-full">

            <View className={`flex-row items-center rounded-full px-3 py-1.5 gap-3 bg-zinc-100 border ${focused ? 'border-zinc-300' : 'border-transparent'}`}>
                <Search size={17} color={focused ? '#3f3f46' : '#a1a1aa'} />
                <TextInput
                    className="flex-1 text-zinc-800 text-sm"
                    placeholder="What do you want to listen to?"
                    placeholderTextColor="#a1a1aa"
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.6}>
                        <View className="bg-zinc-300 rounded-full p-0.5">
                            <X size={12} color="#52525b" strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {focused && (
                <View className="mt-2">

                    <View className="flex-row items-center gap-3 px-2 mb-1">
                        <View className="flex-1 h-px bg-zinc-100" />
                        <Text className="text-[10px] tracking-widest uppercase text-zinc-400">
                            {query.length > 0 ? 'Results' : 'Recent'}
                        </Text>
                        <View className="flex-1 h-px bg-zinc-100" />
                    </View>

                    <FlatList
                        data={results}
                        scrollEnabled={false}
                        keyExtractor={(item) => item}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => {
                                    setQuery(item);
                                    setFocused(false);
                                }}
                            >
                                <View className="flex-row items-center gap-3 px-2 py-3 border-b border-zinc-100">
                                    <View className="w-8 h-8 rounded-full bg-zinc-100 items-center justify-center">
                                        <Clock size={14} color="#a1a1aa" />
                                    </View>
                                    <Text className="flex-1 text-sm text-zinc-700">{item}</Text>
                                    <TouchableOpacity
                                        hitSlop={8}
                                        onPress={() => { }}
                                    >
                                        <X size={13} color="#d4d4d8" strokeWidth={2} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                    />

                </View>
            )}

        </View>
    );
}