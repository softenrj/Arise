// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { IMusicTrack, IPlayListMusicTrack, PlayList, PlayListMusic } from '@/types/database';
import React, { createContext, useMemo, useState } from 'react';

interface PlaylistContextType {
    playlist: PlayList | null;
    playlistMusics: IPlayListMusicTrack[];
    setPlayList: (playlist: PlayList) => void;
    setPlayListMusic: (musics: PlayListMusic[]) => void;
}

export const PlaylistContext = createContext<PlaylistContextType>({
    playlist: null,
    playlistMusics: [],
    setPlayList: () => { },
    setPlayListMusic: () => { },
});

export default function PlayListProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { musics } = useMusic();

    const [playlist, setPlaylist] = useState<PlayList | null>(null);
    const [playlistEntries, setPlaylistEntries] = useState<PlayListMusic[]>([]);

    const playlistMusics = useMemo<IPlayListMusicTrack[]>(() => {
        const musicMap = new Map<string, IMusicTrack>(
            musics.map((music) => [music.id, music])
        );

        return playlistEntries.reduce<IPlayListMusicTrack[]>(
            (result, playlistMusic) => {
                const music = musicMap.get(playlistMusic.musicId);

                if (!music) return result;

                result.push({
                    ...music,
                    ...playlistMusic,
                });

                return result;
            },
            []
        );
    }, [playlistEntries, musics]);

    return (
        <PlaylistContext.Provider
            value={{
                playlist,
                playlistMusics,
                setPlayList: setPlaylist,
                setPlayListMusic: setPlaylistEntries,
            }}
        >
            {children}
        </PlaylistContext.Provider>
    );
}