// Copyright (c) 2026 Raj
// See LICENSE for detail

import { useMusic } from '@/hooks/useMusic';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { saveMedia } from '@/service/persistMedia';
import { setAvatar, setName } from '@/store/reducer/userSlice';
import { defaultAvtar } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Moon, Shield, Star, User } from 'lucide-react-native';
import React from 'react';
import { Image, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Matrics from './Matrics';

export default function Settings({ onTerm }: { onTerm: () => void }) {
    const router = useRouter();
    const { toggleWaveProgress, waveProgress } = useMusic();
    const { name: _name, avatar: _avtar } = useAppSelector(state => state.userReducer);

    const [avatar, setAvatarLocal] = React.useState<string | null>(null);
    const [name, setNameLocal] = React.useState<string>('');
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        setAvatarLocal(_avtar);
        setNameLocal(_name);
    }, [_avtar, _name]);

    const handleImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ['images'],
                quality: 1,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;
            setAvatarLocal(result.assets[0].uri);
        } catch (error) {
            console.log("Error picking documents:", error);
        }
    }

    const handleSaveProfile = async () => {
        try {
            let media = defaultAvtar;

            if (avatar && avatar !== _avtar) {
                media = await saveMedia(avatar, 'image', 'user');
            }

            const payload = {
                name,
                avatar: media,
            };

            await AsyncStorage.setItem(
                'user',
                JSON.stringify(payload)
            );

            dispatch(setName(name));
            dispatch(setAvatar(media));
        } catch (error) {
            console.error('Failed saving profile:', error);
        }
    };

    const handleGetStarterPage = () => {
        AsyncStorage.removeItem('continue');
        router.push("/");
    }

    return (
        <View className="px-5 pt-6">

            <View className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-6 items-center">
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="relative mb-5"
                    onPress={handleImagePicker}
                >
                    <Image
                        source={{ uri: avatar || defaultAvtar }}
                        className="w-28 h-28 rounded-full border-4 border-slate-50 bg-slate-100"
                        resizeMode="cover"
                    />
                    <View className="absolute bottom-0 right-0 bg-slate-900 w-9 h-9 rounded-full items-center justify-center border-4 border-white shadow-sm">
                        <Camera size={14} color="#ffffff" />
                    </View>
                </TouchableOpacity>

                <View className="w-full gap-2 mb-4">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Display Name
                    </Text>
                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1">
                        <User size={20} color="#94a3b8" />
                        <TextInput
                            value={name}
                            onChangeText={setNameLocal}
                            placeholder="Enter your name"
                            placeholderTextColor="#94a3b8"
                            className="flex-1 py-3 px-3 text-base text-slate-900 font-medium"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSaveProfile}
                    className="w-full bg-slate-900 py-3.5 rounded-md items-center"
                >
                    <Text className="text-white text-base font-bold">Save Profile</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-2 mb-2">
                Preferences
            </Text>
            <View className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
                <SettingRow
                    icon={<Moon size={22} color="#64748b" />}
                    title="Wave Progress"
                    rightElement={
                        <Switch
                            value={waveProgress}
                            onValueChange={toggleWaveProgress}
                            trackColor={{ false: '#e2e8f0', true: '#0f172a' }}
                            thumbColor={waveProgress ? '#f8fafc' : '#64748b'}

                        />
                    }
                />
                <SettingRow
                    icon={<Star fill={'#eab308'} size={22} color="#eab308" />}
                    title="Get Stater Page"
                    onPress={handleGetStarterPage}
                />
            </View>

            <Matrics />

            <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-2 mb-2">
                About & Data
            </Text>
            <View className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
                <SettingRow
                    icon={<Shield size={22} color="#64748b" />}
                    title="Privacy Policy"
                    onPress={onTerm}
                />
                <View className="h-[1px] bg-slate-100 ml-12" />
            </View>

            <Text className="text-center text-slate-400 text-xs font-medium">
                Arise v1.0.0
            </Text>

        </View>
    );
}

interface SettingRowProps {
    icon: React.ReactNode;
    title: string;
    titleColor?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
}

function SettingRow({ icon, title, titleColor = "text-slate-700", rightElement, onPress }: SettingRowProps) {
    const Component = onPress ? TouchableOpacity : View;
    return (
        <Component
            activeOpacity={0.7}
            onPress={onPress}
            className="flex-row items-center justify-between px-5 py-4"
        >
            <View className="flex-row items-center">
                {icon}
                <Text className={`text-base font-semibold ml-4 ${titleColor}`}>
                    {title}
                </Text>
            </View>
            {rightElement && rightElement}
        </Component>
    );
}