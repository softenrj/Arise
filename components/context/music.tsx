// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useSQLiteContext } from "expo-sqlite";
import React from "react";

import { useAppDispatch } from "@/hooks/useRedux";
import { getAllMusics } from "@/service/database";
import { getRecentPlays, getRecomendations } from "@/service/musicAnalyticsdb";
import { getPlayListRecomendation } from "@/service/playlistdb";
import { getFirstTrackFromMusic } from "@/service/TrackMaker";
import { updateMusic } from "@/store/reducer/trackplayerSlice";
import { IMusicTrack, PlayListRecomendation } from "@/types/database";

interface IMusicContext {
  musics: IMusicTrack[];
  filteredMusic: IMusicTrack[];
  loading: boolean;
  recent: IMusicTrack[];
  shorts: IMusicTrack[];
  playlist: PlayListRecomendation | null;
  recommendedMusic: IMusicTrack[];
  handpickedMusic: IMusicTrack[];
  setRecent: (music: IMusicTrack[]) => void;
  setShorts: (music: IMusicTrack[]) => void;
  setPlaylist: (music: PlayListRecomendation | null) => void;
  setRecommendedMusic: (music: IMusicTrack[]) => void;
  setHandpickedMusic: (music: IMusicTrack[]) => void;
  setMusic: (music: IMusicTrack[]) => void;
  onReloadHomeData: () => Promise<void>;
  setLike: (musicId: string, likeValue: 0 | 1) => void;
  onMusicRefresh: () => Promise<void>;
  onMusicUpdate: (music: IMusicTrack) => Promise<void>;
}

export const musicContext = React.createContext<IMusicContext>({
  musics: [],
  filteredMusic: [],
  loading: false,
  recent: [],
  shorts: [],
  playlist: null,
  recommendedMusic: [],
  handpickedMusic: [],
  setRecent: () => { },
  setShorts: () => { },
  setPlaylist: () => { },
  setRecommendedMusic: () => { },
  setHandpickedMusic: () => { },
  setMusic: () => { },
  setLike: () => { },
  onMusicRefresh: async () => { },
  onMusicUpdate: async () => { },
  onReloadHomeData: async () => { },
});

function MusicContextProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const dispatch = useAppDispatch();
  const [musics, setMusics] = React.useState<IMusicTrack[]>([]);
  const [loading, setLoading] = React.useState(false);
  const filteredMusic = React.useMemo(() => musics.filter((music) => !music.visible), [musics]);

  // Home Screen Data
  const [recent, setRecent] = React.useState<IMusicTrack[]>([]);
  const [shorts, setShorts] = React.useState<IMusicTrack[]>([]);
  const [playlist, setPlaylist] = React.useState<PlayListRecomendation | null>(null);
  const [recommendedMusic, setRecommendedMusic] = React.useState<IMusicTrack[]>([]);
  const [handpickedMusic, setHandpickedMusic] = React.useState<IMusicTrack[]>([]);

  //#region  HOME SCREEN STATE HANDLER 

  const handleRecent = React.useCallback(async () => {
    const recent = await getRecentPlays(db, 15);
    setRecent(recent)
  }, [db])

  const handleShorts = React.useCallback(async () => {
    const shuffled = [...filteredMusic];
    console.log(shuffled.length)

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShorts(shuffled.slice(0, 4))
    console.log(shorts)
  }, [filteredMusic])

  const handlePlaylist = React.useCallback(async () => {
    const playlist = await getPlayListRecomendation(db);
    setPlaylist(playlist)
  }, [db])

  const handleRecommendedMusic = React.useCallback(async () => {
    const recommendedMusic = await getRecomendations(db, 15);
    setRecommendedMusic(recommendedMusic)
  }, [db])

  const handleHandpickedMusic = React.useCallback(async () => {
    const shuffled = [...filteredMusic];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setHandpickedMusic(shuffled.slice(0, 8));
  }, [filteredMusic])


  const handleHomeData = React.useCallback(async () => {
    await Promise.all([
      handleRecent(),
      handleShorts(),
      handlePlaylist(),
      handleRecommendedMusic(),
      handleHandpickedMusic()
    ]);
  }, [handleRecent, handleShorts, handlePlaylist, handleRecommendedMusic, handleHandpickedMusic])

  //#endregion 

  const loadMusicData = React.useCallback(async () => {
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

  const handleSetMusic = React.useCallback((music: IMusicTrack[]) => {
    setMusics(music);
  }, []);

  const handleSetLike = React.useCallback(
    (musicId: string, likeValue: 0 | 1) => {
      setMusics((prev) => prev.map((music) => music.id === musicId ? { ...music, isLiked: likeValue, } : music));
    }, []);

  const handleRefresh = React.useCallback(async () => {
    await loadMusicData();
  }, [loadMusicData]);

  const handleUpdateMusic = React.useCallback(
    async (updatedMusicTrack: IMusicTrack) => {
      setMusics((prev) => prev.map((music) => music.id === updatedMusicTrack.id ? updatedMusicTrack : music));
      dispatch(updateMusic(getFirstTrackFromMusic(updatedMusicTrack)));
    },
    [dispatch]
  );



  React.useEffect(() => {
    loadMusicData();
  }, [loadMusicData]);

  const contextValue = React.useMemo(
    () => ({
      musics, filteredMusic, loading, setMusic: handleSetMusic,
      setLike: handleSetLike, onMusicRefresh: handleRefresh, onMusicUpdate: handleUpdateMusic,
      recent, shorts, playlist, recommendedMusic, handpickedMusic,
      setRecent, setShorts, setPlaylist, setRecommendedMusic, setHandpickedMusic,
      onReloadHomeData: handleHomeData,
    }),
    [musics, filteredMusic, loading, handleSetMusic, handleSetLike,
      handleRefresh, handleUpdateMusic, recent, shorts, playlist,
      recommendedMusic, handpickedMusic, setRecent, setShorts,
      setPlaylist, setRecommendedMusic, setHandpickedMusic, handleHomeData,
    ]
  );

  return (
    <musicContext.Provider value={contextValue}>
      {children}
    </musicContext.Provider>
  );
}

export default MusicContextProvider;