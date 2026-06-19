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
import { HashedIMusicTrackList, IMusicTrack, PlayListRecomendation } from "@/types/database";
import * as Crypto from "expo-crypto";

interface IMusicContext {
  musics: HashedIMusicTrackList;
  filteredMusic: IMusicTrack[];
  loading: boolean;
  recent: HashedIMusicTrackList;
  shorts: HashedIMusicTrackList;
  playlist: PlayListRecomendation | null;
  recommendedMusic: HashedIMusicTrackList;
  handpickedMusic: HashedIMusicTrackList;
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
  likedMusics: HashedIMusicTrackList;
  handleShots: () => void;
  handleLiked: () => void;
  handleTopPick: () => void;
}

export const musicContext = React.createContext<IMusicContext>({
  musics: { queueHash: "default", tracks: [] },
  filteredMusic: [],
  loading: false,
  recent: { queueHash: "default", tracks: [] },
  shorts: { queueHash: "default", tracks: [] },
  playlist: null,
  recommendedMusic: { queueHash: "default", tracks: [] },
  handpickedMusic: { queueHash: "default", tracks: [] },
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
  likedMusics: { queueHash: "default", tracks: [] },
  handleLiked: () => { },
  handleShots: () => { },
  handleTopPick: () => { }
});

function MusicContextProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const dispatch = useAppDispatch();
  const [musics, setMusics] = React.useState<HashedIMusicTrackList>({ queueHash: "default", tracks: [] });
  const [loading, setLoading] = React.useState(false);
  const filteredMusic = React.useMemo(() => musics.tracks.filter((music) => music.visible !== 0), [musics]);
  const [waveProgress, setWaveProgress] = React.useState<boolean>(false);

  const toggleWaveProgress = React.useCallback(() => setWaveProgress(prev => !prev), []);

  // Home Screen Data
  const [recent, setRecent] = React.useState<HashedIMusicTrackList>({ queueHash: "default", tracks: [] });
  const [shorts, setShorts] = React.useState<HashedIMusicTrackList>({ queueHash: "default", tracks: [] });
  const [playlist, setPlaylist] = React.useState<PlayListRecomendation | null>(null);
  const [recommendedMusic, setRecommendedMusic] = React.useState<HashedIMusicTrackList>({ queueHash: "default", tracks: [] });
  const [handpickedMusic, setHandpickedMusic] = React.useState<HashedIMusicTrackList>({ queueHash: "default", tracks: [] });
  const [likedMusic, setLikedMusic] = React.useState<HashedIMusicTrackList>({ queueHash: "default", tracks: [] });


  const handleSetRecent = React.useCallback((music: IMusicTrack[]) => {
    const hash = Crypto.randomUUID();
    setRecent({ tracks: music, queueHash: hash })
  }, [])

  const handleSetShots = React.useCallback((music: IMusicTrack[]) => {
    const hash = Crypto.randomUUID();
    setShorts({ tracks: music, queueHash: hash })
  }, [])

  const handleSetRecomendation = React.useCallback((music: IMusicTrack[]) => {
    const hash = Crypto.randomUUID();
    setRecommendedMusic({ tracks: music, queueHash: hash })
  }, [])

  const handleSetHandPicked = React.useCallback((music: IMusicTrack[]) => {
    const hash = Crypto.randomUUID();
    setHandpickedMusic({ tracks: music, queueHash: hash })
  }, [])

  //#region  HOME SCREEN STATE HANDLER 

  const handleRecent = React.useCallback(async () => {
    const recent = await getRecentPlays(db, 15);
    setRecent(recent)
  }, [db])

  const handleShorts = () => {
    const shuffled = [...filteredMusic];
    const hash = Crypto.randomUUID();

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShorts({ tracks: shuffled.slice(0, 4), queueHash: hash })
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
    const hash = Crypto.randomUUID();

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setHandpickedMusic({ tracks: shuffled.slice(0, 8), queueHash: hash });
  }, [filteredMusic])

  const handleLikedMusic = React.useCallback(() => {
    const likedM = filteredMusic.map(item => item.isLiked === 1 ? item : null).filter(Boolean) as IMusicTrack[];
    const hash = Crypto.randomUUID();
    setLikedMusic({ tracks: likedM, queueHash: hash });
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
    const hash = Crypto.randomUUID();
    setMusics({ tracks: music, queueHash: hash });
  }, []);

  const handleSetLike = React.useCallback(
    (musicId: string, likeValue: 0 | 1) => {
      setMusics((prev) => {
        const updatedTracks = prev.tracks.map((music) =>
          music.id === musicId ? { ...music, isLiked: likeValue } : music
        );

        return {
          ...prev,
          tracks: updatedTracks,
        };
      });
    },
    [setMusics]
  );

  const handleRefresh = React.useCallback(async () => {
    await loadMusicData();
  }, [loadMusicData]);

  const handleUpdateMusic = React.useCallback(
    async (updatedMusicTrack: IMusicTrack) => {
      setMusics((prev) => ({
        ...prev,
        tracks: prev.tracks.map((music) =>
          music.id === updatedMusicTrack.id ? updatedMusicTrack : music
        ),
      }));

      dispatch(updateMusic(getFirstTrackFromMusic(updatedMusicTrack)));
    },
    [dispatch]
  );

  const handleMusicLike = React.useCallback(
    async (musicId: string, v: 0 | 1) => {
      const music = musics.tracks.find((item) => item.id === musicId);

      if (!music) return;

      const updatedMusicTrack = { ...music, isLiked: v, musicId: music.id };

      setMusics((prev) => ({
        ...prev,
        tracks: prev.tracks.map((item) =>
          item.id === musicId ? updatedMusicTrack : item
        ),
      }));

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
      setRecent: handleSetRecent, setShorts: handleSetShots, setPlaylist, setRecommendedMusic: handleSetRecomendation, setHandpickedMusic: handleSetHandPicked,
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