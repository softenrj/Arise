// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { getAllMusics } from "@/service/database";
import { IMusicTrack } from "@/types/database";
import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

interface IMusicContext {
  musics: IMusicTrack[];
  filteredMusic: IMusicTrack[];
  loading: boolean;
  setMusic: (music: IMusicTrack[]) => void;
  onMusicRefresh: () => Promise<void>;
  onMusicUpdate: (m: IMusicTrack) => Promise<void>;
}

export const musicContext = createContext<IMusicContext>({
  musics: [],
  filteredMusic: [],
  loading: false,
  setMusic: () => { },
  onMusicRefresh: () => Promise.resolve(),
  onMusicUpdate: () => Promise.resolve()
});

function MusicContextProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();

  const [musics, setMusics] = useState<IMusicTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSetMusic = useCallback((music: IMusicTrack[]) => {
    setMusics(music);
  }, []);

  const loadMusicData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllMusics(db);
      setMusics(data);
    } catch (error) {
      console.error("Failed to load music:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const handleRefresh = useCallback(async () => {
    return loadMusicData();
  }, [loadMusicData]);

  const handleUpdateMusic = useCallback(async (updatedMusic: IMusicTrack) => {
    setMusics((prevMusics) =>
      prevMusics.map((m) => (m.id === updatedMusic.id ? updatedMusic : m))
    );
  }, []);

  const filteredMusic = useMemo(() => {
    return musics.filter((m) => !m.visible);
  }, [musics]);

  useEffect(() => {
    loadMusicData();
  }, [loadMusicData]);

  const contextValue = useMemo(() => ({
    musics,
    filteredMusic,
    loading,
    setMusic: handleSetMusic,
    onMusicRefresh: handleRefresh,
    onMusicUpdate: handleUpdateMusic
  }), [musics, filteredMusic, loading, handleSetMusic, handleRefresh, handleUpdateMusic]);

  return (
    <musicContext.Provider value={contextValue}>
      {children}
    </musicContext.Provider>
  );
}

export default MusicContextProvider;