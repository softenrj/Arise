// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppTheme } from '@/hooks/useAppTheme';
import { LucideProps } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, ImageSourcePropType, Text, View } from 'react-native';
import { AppTheme } from '../context/apptheme';

export default function CustomeTab({ name, Icon, image = null }: { name: string, Icon?: React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>> | null, image?: ImageSourcePropType | null }) {
    const { theme } = useAppTheme();
    const { colorScheme } = useColorScheme();
    const _theme = colorScheme === 'dark' ? colorScheme : theme;
    return (
        <View className='flex items-center gap-1'>
            {Icon && <Icon className={_theme === AppTheme.dark ? 'text-white' : 'text-black'} color={_theme === AppTheme.dark ? 'white' : 'black'} size={20} />}
            {image && <Image source={image} className='w-[1.5rem] h-[1.5rem]' />}
            <Text className={`${_theme === AppTheme.dark ? 'text-white' : 'text-black'} font-elms-med`}>{name}</Text>
        </View>
    )
}