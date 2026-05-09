import React from 'react'
import { Text, View } from 'react-native'
import NavBar from '../common/NavBar'

export default function index() {
    return (
        <View className='bg-white flex-1'>
            <NavBar />
            <View className='justify-center items-center flex-1'>
                <Text className='text-5xl font-elms text-black'>home</Text>
            </View>
        </View>
    )
}