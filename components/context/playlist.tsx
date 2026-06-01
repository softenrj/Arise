// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { IMusicTrack, IPlayListMusicTrack, PlayList, PlayListMusic } from '@/types/database';
import React from 'react';

interface PlayListContext {
    playlistMusics: IPlayListMusicTrack[];
    playlist: PlayList | null
    setPlayListMusic: (musics: PlayListMusic[]) => void;
    setPlayList: (p: PlayList) => void
}

export const PlaylistContext = React.createContext<PlayListContext>({
    playlist: null,
    playlistMusics: [],
    setPlayListMusic: () => { },
    setPlayList: () => { }
})
const PlayListProvider = ({ children }: { children: React.ReactNode }) => {
    const { musics } = useMusic();
    const [music, setMusic] = React.useState<IPlayListMusicTrack[]>([]);
    const [playlist, setPlaylist] = React.useState<PlayList | null>(null);

    const handleSetPlayList = (p: PlayList) => setPlaylist(p);

    const handleSetMusic = (playlistMusics: PlayListMusic[]) => {
        const musicMap = new Map<string, IMusicTrack>();

        for (const music of musics) {
            musicMap.set(music.id, music);
        }

        const result = playlistMusics
            .map((playlistMusic) => {
                const metadata = musicMap.get(playlistMusic.musicId);

                if (!metadata) return null;

                return {
                    ...metadata,
                    ...playlistMusic,
                };
            })
            .filter(Boolean) as IPlayListMusicTrack[];

        setMusic(result);
    };
    return (
        <PlaylistContext.Provider value={{ playlist: playlist, playlistMusics: music, setPlayList: handleSetPlayList, setPlayListMusic: handleSetMusic }}>
            {children}
        </PlaylistContext.Provider>
    )
}

export default PlayListProvider