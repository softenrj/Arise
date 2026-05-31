// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { getAllMusics } from "@/service/database";
import { IMusicTrack } from "@/types/database";
import { useSQLiteContext } from "expo-sqlite";
import React from 'react';

interface IMusicContext {
  musics: IMusicTrack[];
  loading: boolean;
  setMusic: (music: IMusicTrack[]) => void;
  onMusicRefresh: () => Promise<void>;
  onMusicUpdate: (m: IMusicTrack) => Promise<void>;
}

export const musicContext = React.createContext<IMusicContext>({
  musics: [],
  loading: false,
  setMusic: () => { },
  onMusicRefresh: () => Promise.resolve(),
  onMusicUpdate: () => Promise.resolve()
});

function MusicContextProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();

  const [musics, setMusics] = React.useState<IMusicTrack[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSetMusic = (music: IMusicTrack[]) => setMusics(music);

  const loadMusicData = async () => {
    try {
      setLoading(true);
      const data = await getAllMusics(db);
      setMusics(data);
    } catch (error) {
      console.error("Failed to load music:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    return loadMusicData();
  };

  const handleUpdateMusic = async (updatedMusic: IMusicTrack) => {
    const updatedQueue = musics.map(m => {
      if (m.id === updatedMusic.id) return updatedMusic;
      return m;
    });

    setMusics(updatedQueue);
  };

  React.useEffect(() => {
    loadMusicData();
  }, []);

  return (
    <musicContext.Provider
      value={{
        musics,
        loading,
        setMusic: handleSetMusic,
        onMusicRefresh: handleRefresh,
        onMusicUpdate: handleUpdateMusic
      }}
    >
      {children}
    </musicContext.Provider>
  )
}

export default MusicContextProvider;