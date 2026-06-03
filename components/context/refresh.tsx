// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import React from 'react';

interface Refresh {
  refresh: boolean;
  onRefresh: () => Promise<void>;
  playlistRefresh: boolean; // act as trigger
  onPlaylistRefresh: () => void;
}

export const RefreshContext = React.createContext<Refresh>({
  refresh: false,
  onRefresh: () => Promise.resolve(),
  playlistRefresh: false,
  onPlaylistRefresh: () => { }
});

function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [refresh, setRefresh] = React.useState<boolean>(false);
  const [playlistRefresh, setPlayListRefresh] = React.useState<boolean>(false);
  const { onMusicRefresh } = useMusic();

  const handleRefresh = async () => {
    setRefresh(true);

    /** * Actions perform during refresh
     */
    await onMusicRefresh();

    setRefresh(false);
  }

  const handlePlayListRefresh = React.useCallback(() => setPlayListRefresh(prev => !prev), []);

  return (
    <RefreshContext.Provider value={{ refresh, onRefresh: handleRefresh, playlistRefresh, onPlaylistRefresh: handlePlayListRefresh }}>
      {children}
    </RefreshContext.Provider>
  )
}

export default RefreshProvider;