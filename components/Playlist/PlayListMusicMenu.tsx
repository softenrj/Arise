// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { EllipsisVertical, Heart, X } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';
import { Menu, MenuItem, MenuItemLabel } from '../ui/menu';

export default function PlayListMusicMenu() {
    return (
        <Menu
            className="bg-neutral-900 rounded-xl border border-neutral-800 p-1 w-36 right-2 shadow-2xl"
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
                key="Favourite"
                textValue="Favourite"
                className="w-full min-w-0 px-2 py-1.5 flex-row items-center gap-2.5 rounded-lg active:bg-neutral-800 border-b border-neutral-800 mb-0.5 pb-2"
            >
                <Heart size={14} color="#fb7185" fill={'#fb7185'} />
                <MenuItemLabel size="sm" className="text-neutral-200 font-medium text-xs tracking-wide">
                    Favourite
                </MenuItemLabel>
            </MenuItem>

            <MenuItem
                key="Share"
                textValue="Share"
                className="w-full min-w-0 px-2 py-1.5 flex-row items-center gap-2.5 rounded-lg active:bg-neutral-800"
            >
                <X size={14} color="#fb7185" />
                <MenuItemLabel size="sm" className="text-neutral-200 font-medium text-xs tracking-wide">
                    Remove
                </MenuItemLabel>
            </MenuItem>
        </Menu>
    );
}