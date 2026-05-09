import React from 'react'
import { Text, View } from 'react-native'

export default function CustomeTab({ name, Icon }: { name: string, Icon: React.ElementType }) {
    return (
        <View className='flex items-center gap-1'>
            <Icon className='text-black' size={20} />
            <Text className='text-black font-elms-med'>{name}</Text>
        </View>
    )
}