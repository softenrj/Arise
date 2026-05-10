import { AppDrawerContext } from "@/app/(tabs)/_layout";
import { useContext } from "react";

export const useAppDrawer = () => useContext(AppDrawerContext);
