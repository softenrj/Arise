// Copyright (c) 2026 Raj 
// See LICENSE for details.

import GetStarted from "@/components/GetStarted";
import AriseLogo from "@/components/GetStarted/Arise";
import Home from "@/components/Home";
import MusicoftheDay from "@/components/Home/MusicOftheDay";
import Playlist from "@/components/Home/Playlist";
import Recent from "@/components/Home/Recent";
import Recommendations from "@/components/Home/Recommendations";
import Shorts from "@/components/Home/Shorts";
import { ComponentType } from "react";

export const sectionsRegistry: Record<string, ComponentType<any>> = {
    AriseLogo: AriseLogo,
    GetStarted: GetStarted,

    //? home page
    Home: Home,
    Recent: Recent,
    Music_Of_The_Day: MusicoftheDay,
    Shorts: Shorts,
    Recommendations: Recommendations,
    Playlist: Playlist
}