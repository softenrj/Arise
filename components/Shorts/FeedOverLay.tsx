import LottieView from 'lottie-react-native';
import { Bookmark, Heart, Plus, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, LayoutAnimation, Pressable, Text, View } from 'react-native';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';

export default function FeedOverLay() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View className='absolute z-10 inset-0 justify-end pb-6 px-4' pointerEvents="box-none">
            <View className='flex-row items-end justify-between w-full' pointerEvents="box-none">

                <View className='flex-1 mr-6 gap-3' pointerEvents="box-none">

                    <View className='flex-row items-center gap-3'>
                        <Avatar size="md" className="border border-white/20">
                            <AvatarFallbackText>Raj</AvatarFallbackText>
                            <AvatarImage
                                source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQsIKyVHCLjg95THmDo9ePbUjZtcHH_t0Jqg&s' }}
                            />
                        </Avatar>
                        <Text numberOfLines={1} className='text-[15px] font-bold text-white shadow-md'>
                            @softenrj
                        </Text>
                    </View>

                    <Pressable onPress={toggleExpand} className="active:opacity-80">
                        <Text
                            numberOfLines={isExpanded ? undefined : 2}
                            className='text-white text-[14px] leading-snug shadow-md'
                        >
                            Building an AI-first online IDE that uses WebContainers and Monaco Editor to generate full codebases. Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto, veniam!
                        </Text>
                        {!isExpanded && (
                            <Text className="text-white/70 font-bold text-[13px] mt-1">
                                more
                            </Text>
                        )}
                    </Pressable>
                </View>

                <View className='items-center gap-5' pointerEvents="box-none">

                    <View className="items-center gap-1">
                        <Pressable
                            onPress={() => setIsLiked(!isLiked)}
                            className='w-10 h-10 justify-center items-center relative'
                        >
                            {!isLiked && <Heart size={32} color={'white'} />}
                            {isLiked && (
                                <LottieView
                                    source={require('@/assets/json/like.json')}
                                    autoPlay
                                    loop={false}
                                    style={{ width: 85, height: 85, position: 'absolute' }}

                                />
                            )}
                        </Pressable>
                        <Text className="text-white font-semibold text-xs shadow-md">Like</Text>
                    </View>

                    <View className="items-center gap-1">
                        <Pressable className='w-10 h-10 justify-center items-center'>
                            <Plus size={30} color={'white'} />
                        </Pressable>
                        <Text className="text-white font-semibold text-xs shadow-md">Default</Text>
                    </View>

                    <View className="items-center gap-1">
                        <Pressable
                            onPress={() => setIsSaved(!isSaved)}
                            className='w-10 h-10 justify-center items-center'
                        >
                            <Bookmark
                                size={30}
                                color={'white'}
                                fill={isSaved ? 'white' : 'transparent'}
                            />
                        </Pressable>
                        <Text className="text-white font-semibold text-xs shadow-md">Save</Text>
                    </View>

                    <View className="items-center gap-1">
                        <Pressable className='w-10 h-10 justify-center items-center'>
                            <Send size={30} color={'white'} />
                        </Pressable>
                        <Text className="text-white font-semibold text-xs shadow-md">Share</Text>
                    </View>

                    <View className='justify-center items-center mt-2'>
                        <View className="p-1 bg-white/20 rounded-md">
                            <Image
                                source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh9ybGbX0RSnBFVlBeSOkzzlPi4O2eT5AH2w&s" }}
                                className='w-10 h-10 rounded-sm'
                            />
                        </View>
                    </View>

                </View>

            </View>
        </View>
    );
}