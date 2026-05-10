// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Zap } from 'lucide-react-native';
import React from 'react';
import MusicLinearList from '../common/MusicLinearList';

export default function Recent() {
    return (
        <MusicLinearList title="Recent" subTitle={`Pick up where\nyou left off.`} Icon={Zap} />
    )
}