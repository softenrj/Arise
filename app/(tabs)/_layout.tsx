// Copyright (c) 2026 Raj 
// See LICENSE for details.

import AppDrawer from "@/components/common/AppDrawer";
import CustomeTab from "@/components/common/CustomeTab";
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
                    className="w-full bg-white flex-row items-center justify-around px-4 py-3 shadow-2xl"
                >
                    <TabTrigger name="Home" href={"/home"}>
                        <CustomeTab name="Home" Icon={Home} />
                    </TabTrigger>

                    <TabTrigger name="Search" href={"/search"}>
                        <CustomeTab name="Search" Icon={Search} />
                    </TabTrigger>

                    <TabTrigger name="Vibes" href={"/vibes"}>
                        <CustomeTab name="Vibes" Icon={Home} />
                    </TabTrigger>

                    <TabTrigger name="Library" href={"/library"}>
                        <CustomeTab name="Library" Icon={Library} />
                    </TabTrigger>

                </TabList>
            </Tabs>
            <AppDrawer onClose={handleClose} open={open} /></>
    );
}