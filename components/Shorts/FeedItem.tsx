// Copyright (c) 2026 Raj 
// See LICENSE for detail

import { useEvent } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer } from 'expo-video';
import React, { useState } from 'react';
import { Image, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '../ui/slider';
import FeedOverLay from './FeedOverLay';

const videoSource =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function FeedItem({ containerHeight }: { containerHeight: number }) {
    const [isScrubbing, setIsScrubbing] = useState(false);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scaleY: withTiming(isScrubbing ? 2 : 1, { duration: 150 }) }
            ]
        };
    });

    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.play();
    });

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

    return (
        <View className='relative w-full' style={{ height: containerHeight }}>
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                className="absolute bottom-0 left-0 right-0 h-1/2"
            />

            <Image
                source={{ uri: "https://i.pinimg.com/736x/ec/da/a4/ecdaa4dbb245fa77b72bc31381ae3b5e.jpg" }}
                className='absolute z-0 h-full w-full'
                resizeMode="contain"
            />

            {/* <VideoView
                className='w-full'
                player={player}
                fullscreenOptions={{ enable: true }}
                allowsPictureInPicture
            /> */}

            <FeedOverLay />

            <Animated.View
                style={animatedStyle}
                className='absolute bottom-0 z-50 w-full'
                onTouchStart={() => setIsScrubbing(true)}
                onTouchEnd={() => setIsScrubbing(false)}
                onTouchCancel={() => setIsScrubbing(false)}
            >
                <Slider
                    defaultValue={30}
                    size="sm"
                    orientation="horizontal"
                    isDisabled={false}
                    isReversed={false}
                    className='w-full'
                    onChange={() => setIsScrubbing(true)}
                    onChangeEnd={() => setIsScrubbing(false)}
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb className='opacity-0' />
                </Slider>
            </Animated.View>
        </View>
    );
};