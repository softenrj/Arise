// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { LucideProps } from 'lucide-react-native';
import React from 'react';
import { Image, ImageSourcePropType, Text, View } from 'react-native';

export default function CustomeTab({ name, Icon, image = null }: { name: string, Icon?: React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>> | null, image?: ImageSourcePropType | null }) {
    return (
        <View className='flex items-center gap-1'>
            {Icon && <Icon className='text-white' color={'white'} size={20} />}
            {image && <Image source={image} className='w-[1.5rem] h-[1.5rem]' />}
            <Text className='text-white font-elms-med'>{name}</Text>
        </View>
    )
}