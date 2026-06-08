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
  onMusicLike: (musicId: string, likeValue: 0 | 1) => Promise<void>;
  waveProgress: boolean;
  toggleWaveProgress: () => void;
  likedMusics: IMusicTrack[];
  handleShots: () => void;
  handleLiked: () => void;
  handleTopPick: () => void;
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
  onMusicLike: async () => { },
  waveProgress: false,
  toggleWaveProgress: () => { },
  likedMusics: [],
  handleLiked: () => { },
  handleShots: () => { },
  handleTopPick: () => { }
});

function MusicContextProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const dispatch = useAppDispatch();
  const [musics, setMusics] = React.useState<IMusicTrack[]>([]);
  const [loading, setLoading] = React.useState(false);
  const filteredMusic = React.useMemo(() => musics.filter((music) => music.visible !== 0), [musics]);
  const [waveProgress, setWaveProgress] = React.useState<boolean>(false);

  const toggleWaveProgress = React.useCallback(() => setWaveProgress(prev => !prev), []);

  // Home Screen Data
  const [recent, setRecent] = React.useState<IMusicTrack[]>([]);
  const [shorts, setShorts] = React.useState<IMusicTrack[]>([]);
  const [playlist, setPlaylist] = React.useState<PlayListRecomendation | null>(null);
  const [recommendedMusic, setRecommendedMusic] = React.useState<IMusicTrack[]>([]);
  const [handpickedMusic, setHandpickedMusic] = React.useState<IMusicTrack[]>([]);
  const [likedMusic, setLikedMusic] = React.useState<IMusicTrack[]>([]);

  //#region  HOME SCREEN STATE HANDLER 

  const handleRecent = React.useCallback(async () => {
    const recent = await getRecentPlays(db, 15);
    setRecent(recent)
  }, [db])

  const handleShorts = () => {
    const shuffled = [...filteredMusic];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShorts(shuffled.slice(0, 4))
  }

  const handlePlaylist = React.useCallback(async () => {
    const playlist = await getPlayListRecomendation(db);
    setPlaylist(playlist)
  }, [db])

  const handleRecommendedMusic = React.useCallback(async () => {
    const recommendedMusic = await getRecomendations(db, 15);
    setRecommendedMusic(recommendedMusic)
  }, [db])

  const handleHandpickedMusic = React.useCallback(() => {
    const shuffled = [...filteredMusic];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setHandpickedMusic(shuffled.slice(0, 8));
  }, [filteredMusic])

  const handleLikedMusic = React.useCallback(() => {
    const likedM = filteredMusic.map(item => item.isLiked === 1 ? item : null).filter(Boolean) as IMusicTrack[];
    setLikedMusic(likedM);
  }, [filteredMusic])


  const handleHomeData = React.useCallback(async () => {
    await Promise.all([
      handleRecent(),
      handlePlaylist(),
      handleRecommendedMusic(),
      handleHandpickedMusic(),
      handleLikedMusic()
    ]);

  }, [handleRecent, handleShorts, handlePlaylist, handleRecommendedMusic, handleHandpickedMusic, handleLikedMusic])


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

  const handleMusicLike = React.useCallback(
    async (musicId: string, v: 0 | 1) => {
      const music = musics.find(item => item.id === musicId);

      if (!music) return;

      const updatedMusicTrack = { ...music, isLiked: v, musicId: music.id };
      setMusics(prev => prev.map(item => item.id === musicId ? updatedMusicTrack : item));
      dispatch(updateMusic(getFirstTrackFromMusic(updatedMusicTrack)));
    },
    [dispatch, musics]
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
      onMusicLike: handleMusicLike, waveProgress, toggleWaveProgress, likedMusics: likedMusic, handleLiked: handleLikedMusic,
      handleShots: handleShorts,
      handleTopPick: handleHandpickedMusic
    }),
    [musics, filteredMusic, loading, handleSetMusic, handleSetLike,
      handleRefresh, handleUpdateMusic, recent, shorts, playlist,
      recommendedMusic, handpickedMusic, setRecent, setShorts,
      setPlaylist, setRecommendedMusic, setHandpickedMusic, handleHomeData,
      handleMusicLike, waveProgress, toggleWaveProgress, likedMusic, handleMusicLike, handleHandpickedMusic, handleShorts
    ]
  );

  return (
    <musicContext.Provider value={contextValue}>
      {children}
    </musicContext.Provider>
  );
}

export default MusicContextProvider;