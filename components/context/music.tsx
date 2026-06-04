// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useSQLiteContext } from "expo-sqlite";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { useAppDispatch } from "@/hooks/useRedux";
import { getAllMusics } from "@/service/database";
import { getFirstTrackFromMusic } from "@/service/TrackMaker";
import { updateMusic } from "@/store/reducer/trackplayerSlice";
import { IMusicTrack } from "@/types/database";

interface IMusicContext {
  musics: IMusicTrack[];
  filteredMusic: IMusicTrack[];
  loading: boolean;
  setMusic: (music: IMusicTrack[]) => void;
  setLike: (musicId: string, likeValue: 0 | 1) => void;
  onMusicRefresh: () => Promise<void>;
  onMusicUpdate: (music: IMusicTrack) => Promise<void>;
}

export const musicContext = createContext<IMusicContext>({
  musics: [],
  filteredMusic: [],
  loading: false,
  setMusic: () => { },
  setLike: () => { },
  onMusicRefresh: async () => { },
  onMusicUpdate: async () => { },
});

function MusicContextProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const dispatch = useAppDispatch();
  const [musics, setMusics] = useState<IMusicTrack[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSetMusic = useCallback((music: IMusicTrack[]) => {
    setMusics(music);
  }, []);

  const handleSetLike = useCallback(
    (musicId: string, likeValue: 0 | 1) => {
      setMusics((prev) =>
        prev.map((music) =>
          music.id === musicId
            ? {
              ...music,
              isLiked: likeValue,
            }
            : music
        )
      );
    }, []);

  const handleRefresh = useCallback(async () => {
    await loadMusicData();
  }, [loadMusicData]);

  const handleUpdateMusic = useCallback(
    async (updatedMusicTrack: IMusicTrack) => {
      setMusics((prev) =>
        prev.map((music) =>
          music.id === updatedMusicTrack.id
            ? updatedMusicTrack
            : music
        )
      );

      dispatch(updateMusic(getFirstTrackFromMusic(updatedMusicTrack)));
    },
    [dispatch]
  );

  const filteredMusic = useMemo(
    () => musics.filter((music) => !music.visible),
    [musics]
  );

  useEffect(() => {
    loadMusicData();
  }, [loadMusicData]);

  const contextValue = useMemo(
    () => ({
      musics,
      filteredMusic,
      loading,
      setMusic: handleSetMusic,
      setLike: handleSetLike,
      onMusicRefresh: handleRefresh,
      onMusicUpdate: handleUpdateMusic,
    }),
    [musics, filteredMusic, loading, handleSetMusic, handleSetLike, handleRefresh, handleUpdateMusic]
  );

  return (
    <musicContext.Provider value={contextValue}>
      {children}
    </musicContext.Provider>
  );
}

export default MusicContextProvider;