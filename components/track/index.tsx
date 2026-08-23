// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useTrackPanle } from "@/hooks/useTrackPanel";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from 'react';
import TrackMusicList from "./TrackMusicList";
import TrackPlayerScreen from './TrackPlayerScreen';

const Index = () => {
    const sheetRef = React.useRef<BottomSheet>(null);
    const { open, onClose } = useTrackPanle();
    const [openPlayListMenu, setOpenPlayListMenu] = React.useState<boolean>(false);
    const handlePlayListMenu = React.useCallback(() => setOpenPlayListMenu(prev => !prev), []);

    const snapPoints = React.useMemo(() => ['100%'], []);

    React.useEffect(() => {
        if (open) {
            sheetRef.current?.expand();
        } else {
            sheetRef.current?.close();
        }
    }, [open]);

    return (
        <>
            <BottomSheet
                ref={sheetRef}
                snapPoints={snapPoints}
                index={open ? 0 : -1}
                onClose={onClose}
                enablePanDownToClose
                topInset={0}
                bottomInset={0}
                enableDynamicSizing={false}
                handleComponent={null}
                backgroundStyle={{ backgroundColor: '#121212', borderRadius: 0 }}
            >
                <BottomSheetScrollView>
                    <TrackPlayerScreen setOpenPlayListMenu={handlePlayListMenu} />
                </BottomSheetScrollView>
            </BottomSheet>

            <TrackMusicList open={openPlayListMenu} onClose={handlePlayListMenu} />
        </>
    );
};

export default Index;