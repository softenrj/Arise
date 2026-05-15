// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { SharedValue } from "react-native-reanimated";

export interface ShortContextType {
    isHolding: SharedValue<boolean>;
    showImage: boolean;
    toggleImagePreview: () => void;
    handleHolding: (val: boolean) => void;
}