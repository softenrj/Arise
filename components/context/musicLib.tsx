import { IMusicTrack } from '@/types/database';
import React, { createContext } from 'react';

interface MusicLib {
    editSheet: boolean;
    openSheet: () => void;
    closeSheet: () => void;
    musics: IMusicTrack[];
    setMusics: (muisc: IMusicTrack[]) => void;

    editMusicId: string;
    setEditMusicId: (id: string) => void;

    handleUpdate: (m: IMusicTrack) => void;
}

export const MusicLibContext = createContext<MusicLib>({
    editSheet: false,
    openSheet: () => { },
    closeSheet: () => { },
    musics: [],
    setMusics: () => { },
    editMusicId: '',
    setEditMusicId: (id: string) => { },
    handleUpdate: (m: IMusicTrack) => { }
})

export default function musicLibProvider({ children }: { children: React.ReactNode }) {
    const [editSheet, setEditSheet] = React.useState<boolean>(false);
    const [music, setMusic] = React.useState<IMusicTrack[]>([]);
    const [editMusicId, setMusicId] = React.useState<string>('');

    const openSheet = () => setEditSheet(true);
    const closeSheet = () => setEditSheet(false);
    const handleEditMusicId = (id: string) => setMusicId(id);

    const handleMusics = (musics: IMusicTrack[]) => setMusic(musics)

    const handleUpdateMusic = (updatedMusic: IMusicTrack) => {
        const updatedQueue = music.map(m => {
            if (m.id === updatedMusic.id) return updatedMusic;
            return m;
        })

        setMusic(updatedQueue);
    }
    return (
        <MusicLibContext.Provider value={{ editSheet, openSheet, closeSheet, setMusics: handleMusics, musics: music, setEditMusicId: handleEditMusicId, editMusicId, handleUpdate: handleUpdateMusic }}>
            {children}
        </MusicLibContext.Provider>
    )
}