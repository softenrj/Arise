import CustomeTab from "@/components/common/CustomeTab";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Home, Library, Search } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs>
            <TabSlot />

            <TabList
                style={{
                    paddingBottom: insets.bottom,
                }}
                className="absolute bottom-0 left-0 right-0 mx-auto flex-row items-center justify-around px-4 py-3 shadow-2xl"
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
    );
}