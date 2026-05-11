import { Section } from "@/types/screenMap";

export const Search: Record<string, Section> = {
    'search': {
        key: 'Search',
        children: [
            { key: 'SearchInput' },
            { key: 'SuggestGrids' },
            { key: 'Shorts' },
        ]
    }
}