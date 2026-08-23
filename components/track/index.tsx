// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useTrackPanle } from "@/hooks/useTrackPanel";
import BottomSheet from "@gorhom/bottom-sheet";
import React from 'react';
import TrackPlayerScreen from './TrackPlayerScreen';

const Index = () => {
    const sheetRef = React.useRef<BottomSheet>(null);
    const { open, onClose } = useTrackPanle();

    const snapPoints = React.useMemo(() => ['100%'], []);

    React.useEffect(() => {
        if (open) {
            sheetRef.current?.expand();
        } else {
            sheetRef.current?.close();
        }
    }, [open]);

    return (
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
            <TrackPlayerScreen />
        </BottomSheet>
    );
};

export default Index;