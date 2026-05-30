// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusicLib } from '@/hooks/useMusicLib';
import { hideMusicdb, removeMusicdb } from '@/service/database';
import { IMusicTrack } from '@/types/database';
import { useSQLiteContext } from 'expo-sqlite';
import { Cog, EllipsisVertical, Eye, ListMusic, Trash } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Menu, MenuItem, MenuItemLabel } from '../ui/menu';

export default function MusicMenu({ musicId }: { musicId: string }) {
    const { closeSheet, musics, editMusicId, handleUpdate, setEditMusicId, openSheet } = useMusicLib();
    const [music, setMusic] = React.useState<IMusicTrack | null>(null);
    const db = useSQLiteContext();
    const [visibility, setVisibility] = React.useState<0 | 1>(1);

    const handleEdit = () => {
        setEditMusicId(musicId);
        openSheet();
    }

    const handleHideMode = React.useCallback(async () => {
        if (!music) return;

        await hideMusicdb(db, visibility, music.id);
        setVisibility(prev => prev === 1 ? 0 : 1);
        closeSheet();
    }, [music])

    const handleDeleteMusic = React.useCallback(async () => {
        await removeMusicdb(db, musicId);
        closeSheet();
    }, [music])

    React.useEffect(() => {
        const track = musics.find(m => m.id === editMusicId);
        if (track) {
            setMusic(track);
            setVisibility(track.visible)

        }
    }, [editMusicId, musics]);


    return (
        <Menu
            className="bg-white border border-zinc-100 rounded-xl shadow-lg shadow-zinc-200/80 overflow-hidden min-w-[180px] right-10"
            offset={6}
            trigger={({ ...triggerProps }) => (
                <Pressable
                    {...triggerProps}
                    className="w-8 h-8 items-center justify-center rounded-full"
                >
                    <EllipsisVertical size={15} color="#71717a" />
                </Pressable>
            )}
        >
            <MenuItem
                key="Queue"
                textValue="Add to Queue"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50 border-b border-zinc-100"
            >
                <View className="w-7 h-7 rounded-lg bg-indigo-50 items-center justify-center">
                    <ListMusic size={14} color="#6366f1" />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 font-medium tracking-wide">
                    Add to Queue
                </MenuItemLabel>
            </MenuItem>

            {/* <MenuItem
                key="Favourite"
                textValue="Favourite"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50 border-b border-zinc-100"
            >
                <View className="w-7 h-7 rounded-lg bg-rose-50 items-center justify-center">
                    <Heart size={14} color="#f43f5e" />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 font-medium tracking-wide">
                    Favourite
                </MenuItemLabel>
            </MenuItem> */}

            <MenuItem
                key="Hide"
                textValue="Hide"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50 border-b border-zinc-100"
                onPress={handleHideMode}
            >
                <View className="w-7 h-7 rounded-lg bg-emerald-50 items-center justify-center">
                    <Eye size={14} color="#10b981" />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 font-medium tracking-wide">
                    {visibility === 1 ? 'Hide' : 'UnHide'}
                </MenuItemLabel>
            </MenuItem>



            <MenuItem
                key="Plugins"
                textValue="Plugins"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50"
                onPress={handleEdit}
            >
                <View className="w-7 h-7 rounded-lg bg-amber-50 items-center justify-center">
                    <Cog size={14} color="#f59e0b" />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 font-medium tracking-wide">
                    Edit
                </MenuItemLabel>
            </MenuItem>

            <MenuItem
                key="Share"
                textValue="Share"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-red-50 border-b border-zinc-100"
                onPress={handleDeleteMusic}
            >
                <View className="w-7 h-7 rounded-lg bg-red-50 items-center justify-center">
                    <Trash size={14} color="#b91c1c" />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 font-medium tracking-wide">
                    Remove
                </MenuItemLabel>
            </MenuItem>
        </Menu>
    );
}