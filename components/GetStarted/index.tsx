// Copyright (c) 2026 Raj 
// See LICENSE for details.

import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ImageBackground, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Arise from './Arise';

const { width } = Dimensions.get('window');

export default function index() {
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(translateX, {
                toValue: -width,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();
    }, [translateX]);

    return (
        <ImageBackground
            source={require("@/assets/images/landing.jpg")}
            className='flex-1'
            resizeMode="cover"
        >

            <SafeAreaView>
                <View className='flex justify-center items-center my-6'>

                    <MaskedView
                        maskElement={
                            <Text className='text-5xl font-ostt text-center bg-transparent'>
                                Welcome
                            </Text>
                        }
                        style={{ height: 60, width: '100%' }}
                    >

                        <Animated.View
                            style={{
                                width: width * 2,
                                height: '100%',
                                transform: [{ translateX }]
                            }}
                        >
                            <LinearGradient
                                colors={['#3b82f6', '#ec4899', '#8b5cf6', '#ec4899', '#3b82f6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ flex: 1 }}
                            />
                        </Animated.View>
                    </MaskedView>

                </View>
            </SafeAreaView>

            <Arise />
        </ImageBackground>
    )
}
