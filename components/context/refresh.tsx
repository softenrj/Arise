// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import React from 'react';

interface Refresh {
  refresh: boolean;
  onRefresh: () => Promise<void>;
}

export const RefreshContext = React.createContext<Refresh>({
  refresh: false,
  onRefresh: () => Promise.resolve()
});

function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [refresh, setRefresh] = React.useState<boolean>(false);
  const { onMusicRefresh } = useMusic();

  const handleRefresh = async () => {
    setRefresh(true);

    /** * Actions perform during refresh
     */
    await onMusicRefresh();

    setRefresh(false);
  }

  return (
    <RefreshContext.Provider value={{ refresh, onRefresh: handleRefresh }}>
      {children}
    </RefreshContext.Provider>
  )
}

export default RefreshProvider;