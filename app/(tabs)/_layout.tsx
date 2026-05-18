// Copyright (c) 2026 Raj 
// See LICENSE for details.

import AppDrawer from "@/components/common/AppDrawer";
import CustomeTab from "@/components/common/CustomeTab";
import { AppTheme } from "@/components/context/apptheme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Home, Library, Search } from "lucide-react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AppDrawerContext = React.createContext({
    open: false,
    onClose: () => { },
    onOpen: () => { }
});

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const [open, setOpen] = React.useState<boolean>(false);
    const { theme } = useAppTheme();

    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);

    return (
        <>
            <Tabs>
                <AppDrawerContext.Provider value={{ open, onClose: handleClose, onOpen: handleOpen }}>
                    <TabSlot />
                </AppDrawerContext.Provider>

                <TabList
                    style={{
                        paddingBottom: insets.bottom,
                    }}
                    className={`w-full flex-row items-center justify-around px-4 py-3 shadow-2xl ${theme === AppTheme.dark ? 'bg-black' : 'bg-white'}`}
                >
                    <TabTrigger name="setting" href={'/setting'} style={{ display: 'none' }} />
                    <TabTrigger name="music library" href={'/(tabs)/music_library'} style={{ display: 'none' }} />
                    <TabTrigger name="music library" href={'/(tabs)/playlist'} style={{ display: 'none' }} />
                    <TabTrigger name="Home" href={"/home"}>
                        <CustomeTab name="Home" Icon={Home} />
                    </TabTrigger>

                    <TabTrigger name="Search" href={"/search"}>
                        <CustomeTab name="Search" Icon={Search} />
                    </TabTrigger>

                    <TabTrigger name="Vibes" href={"/shorts"}>
                        <CustomeTab name="Shorts" image={theme === AppTheme.dark ? require('@/assets/arise/shorts-dark.png') : require('@/assets/arise/shorts.png')} />
                    </TabTrigger>

                    <TabTrigger name="Library" href={"/library"}>
                        <CustomeTab name="Library" Icon={Library} />
                    </TabTrigger>

                </TabList>
            </Tabs>
            <AppDrawer onClose={handleClose} open={open} /></>
    );
}