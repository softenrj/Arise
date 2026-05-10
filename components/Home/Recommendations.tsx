import { Sparkle } from 'lucide-react-native';
import React from 'react';
import MusicLinearList from '../common/MusicLinearList';

export default function Recommendations() {
    return (
        <MusicLinearList title="Recommendations" subTitle={`Back to \nwhat sounds good.`} Icon={Sparkle} />
    )
}