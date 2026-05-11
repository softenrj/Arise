// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Section } from "@/types/screenMap";

export const Home: Record<string, Section> = {
    'home': {
        key: 'Home',
        children: [
            { key: 'Recent' },
            { key: 'Shorts' },
            { key: 'Playlist' },
            { key: 'Recommendations' },
            { key: 'Music_Of_The_Day' },
        ]
    }
}