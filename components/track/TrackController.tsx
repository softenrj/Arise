// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useSQLiteContext } from 'expo-sqlite';
import LottieView from 'lottie-react-native';
import { Heart, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useProgress } from 'react-native-track-player';

import TrackProgressBar from "@/components/track/TrackSlideBar";
import { useMusic } from '@/hooks/useMusic';
import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { likeMusic } from '@/service/database';
import { formatDuration } from '@/service/MusicDuration';
import { AriseTrack } from '@/types/database';


const TrackTimer = memo(function TrackTimer() {
    const { position, duration } = useProgress(500);
    const [timerFormat, setTimerFormat] = useState<'left' | 'default'>('default');

    const toggleTimerFormat = useCallback(() => {
        setTimerFormat((prev) => (prev === 'default' ? 'left' : 'default'));
    }, []);

    const currentProgress = timerFormat === 'default' ? position : Math.max(0, duration - position);

    return (
        <View className="flex-row justify-between">
            <TouchableOpacity onPress={toggleTimerFormat}>
                <Text className="text-white/50">
                    {timerFormat === 'left' && '-'} {formatDuration(currentProgress)}
                </Text>
            </TouchableOpacity>
            <Text className="text-white/50">{formatDuration(duration)}</Text>
        </View>
    );
});


export default function TrackController({ track }: { track: AriseTrack }) {
    const { onMusicLike, waveProgress } = useMusic();
    const db = useSQLiteContext();
    const { loopMode, shuffle } = useAppSelector((state) => state.trackReducer);

    const [showLikeAnimation, setShowLikeAnimation] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<0 | 1>(track?.isLiked || 0);
    const likeAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { skipToPrevious, toggleShuffle, cycleLoopMode, skipToNext, togglePlay, seekTo, isPlaying } = useTrack();

    useEffect(() => {
        setIsLiked(track?.isLiked || 0);
    }, [track?.isLiked]);

    const handleLikeAnimation = useCallback(() => {
        setShowLikeAnimation(true);

        if (likeAnimationTimeoutRef.current) {
            clearTimeout(likeAnimationTimeoutRef.current);
        }

        likeAnimationTimeoutRef.current = setTimeout(() => {
            setShowLikeAnimation(false);
        }, 700);
    }, []);

    const toggleLike = useCallback(async () => {
        if (!track?.musicId) return;
        const setLike = isLiked === 1 ? 0 : 1;
        setIsLiked(setLike);

        const response = await likeMusic(db, track.musicId, setLike);
        if (response) {
            if (setLike === 1) handleLikeAnimation();
            onMusicLike(track.musicId, setLike);
        } else {
            setIsLiked(isLiked);
        }
    }, [track?.musicId, isLiked, db, handleLikeAnimation, onMusicLike]);

    const seekToPosition = useCallback(
        (seconds: number) => {
            seekTo(seconds);
        },
        [seekTo]
    );

    useEffect(() => {
        return () => {
            if (likeAnimationTimeoutRef.current) clearTimeout(likeAnimationTimeoutRef.current);
        };
    }, []);

    return (
        <View className="pb-12 pt-6">
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-1 pr-4">
                    <Text className="text-white text-2xl font-bold truncate" numberOfLines={1}>
                        {track?.title}
                    </Text>
                    <Text className="text-white/70 text-base mt-1" numberOfLines={1}>
                        {track?.artist}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={toggleLike}
                    className="w-10 h-10 justify-center items-center relative"
                >
                    {!showLikeAnimation && (
                        <Heart
                            size={24}
                            color={isLiked ? 'red' : 'white'}
                            fill={isLiked ? 'red' : 'transparent'}
                        />
                    )}

                    {showLikeAnimation && (
                        <LottieView
                            source={require('@/assets/json/like.json')}
                            autoPlay
                            loop={false}
                            hardwareAccelerationAndroid
                            renderMode="HARDWARE"
                            style={{ width: 70, height: 70, position: 'absolute' }}
                        />
                    )}
                </TouchableOpacity>
            </View>

            <View className="gap-2 mb-6">
                <TrackProgressBar waveProgress={waveProgress} isPlaying={isPlaying} seekToPosition={seekToPosition} />
                <TrackTimer />
            </View>

            <View className="flex-row justify-between items-center">
                <TouchableOpacity hitSlop={10} onPress={toggleShuffle}>
                    <Shuffle size={24} color={shuffle ? '#1DB954' : '#fff'} opacity={shuffle ? 1 : 0.5} />
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10} onPress={skipToPrevious}>
                    <SkipBack size={30} color="#fff" fill={'white'} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={togglePlay}
                    className="w-[4.2rem] h-[4.2rem] bg-white rounded-full items-center justify-center"
                >
                    {isPlaying ? (
                        <Pause size={28} color="#000" fill="#000" />
                    ) : (
                        <Play size={28} color="#000" fill="#000" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10} onPress={skipToNext}>
                    <SkipForward size={30} fill={'white'} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity hitSlop={10} onPress={cycleLoopMode} className="justify-center">
                    {loopMode !== 'track' && (
                        <Repeat
                            size={24}
                            color={loopMode !== 'none' ? '#1DB954' : '#fff'}
                            opacity={loopMode !== 'none' ? 1 : 0.5}
                        />
                    )}
                    {loopMode === 'track' && <Repeat1 size={24} color={'#1DB954'} />}
                </TouchableOpacity>
            </View>
        </View>
    );
}