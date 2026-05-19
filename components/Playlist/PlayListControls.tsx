// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Dot, EllipsisVertical, Music, Play } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';

const image = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAeQRuVrnaQlNcbGrvVPcbaTLZaaVtRUBEvw&s";

export default function PlayListControls() {
    return (
        <View className='mx-6 my-4'>

            <View className='flex-row gap-2 -mt-4 mb-2 items-center'>
                <Music size={14} color={'white'} />
                <Text className='text-gray-300'>23</Text>

                <Dot size={18} color={'white'} />
                <Text className='text-gray-400'>2.23 hour</Text>
            </View>

            <View className='flex-row flex-1 w-full justify-between'>
                <View className='flex-row items-center gap-4'>
                    <View className=' flex-row gap-1'>
                        <View className='h-14 w-10 border-[3px] rounded-md border-white'>
                            <Image source={{ uri: image }} resizeMode='cover' className='h-full w-full' />
                        </View>
                        <View className='justify-center items-center gap-1 w-20'>
                            <View className='flex-row items-center gap-3'>
                                <Play size={12} fill={'white'} />
                                <Text className='text-white'>Play</Text>
                            </View>
                            <Text numberOfLines={1} className='text-sm pl-1 whitespace-nowrap font-elms text-gray-400'>in Shots</Text>
                        </View>
                    </View>

                    <Pressable>
                        <TouchableOpacity className='flex-row items-center gap-2'>
                            <EllipsisVertical size={12} color={'white'} />
                            <Text className='text-white text-sm font-elms'>Options</Text>
                        </TouchableOpacity>
                    </Pressable>
                </View>

                <View className='bg-green-500 p-4 rounded-full'>
                    <Play size={20} fill={'black'} />
                </View>
            </View>
        </View>
    )
}