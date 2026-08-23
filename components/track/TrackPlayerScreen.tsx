// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { useTrackPanle } from '@/hooks/useTrackPanel';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ChevronDown, EllipsisVertical, Hd, ListFilter, Music } from 'lucide-react-native';
import React from 'react';
import { InteractionManager, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { getColors } from 'react-native-image-colors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import AddToPlayList from '../common/AddToPlayList';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import Lyrics from './Lyrics';
import TrackController from './TrackController';

const BACKGROUND_COLOR = '#121212';

export default function TrackPlayerScreen({ setOpenPlayListMenu }: { setOpenPlayListMenu: () => void }) {
    const [dominantColor, setDominantColor] = React.useState(BACKGROUND_COLOR);
    const [vibrantColor, setVibrantColor] = React.useState(BACKGROUND_COLOR);
    const [showVideo, setShowVideo] = React.useState<boolean>(false);
    const { onClose } = useTrackPanle();
    const insets = useSafeAreaInsets();

    const { height: screenHeight } = useWindowDimensions();

    const track = useAppSelector((state) => state.trackReducer.queue[state.trackReducer.currentIndex]);
    const playlistName = useAppSelector((state) => state.trackReducer.playlistName);


    const [openAddToPlaylist, setOpenAddToPlaylist] = React.useState<boolean>(false);
    const handleAddToPlaylist = React.useCallback(() => setOpenAddToPlaylist(prev => !prev), []);

    const videoUri = track?.customVideoUri ?? null;
    const videoPlayer = useVideoPlayer(videoUri, React.useCallback((p) => {
        p.loop = true;
        p.muted = true;
        p.play();
    }, []));

    const handleShowView = React.useCallback(() => setShowVideo(prev => !prev), []);

    // Non-blocking color extraction deferred until after animations
    React.useEffect(() => {
        if (!track?.artwork) {
            setDominantColor(BACKGROUND_COLOR);
            setVibrantColor(BACKGROUND_COLOR);
            return;
        }

        let isMounted = true;

        const task = InteractionManager.runAfterInteractions(() => {
            getColors(track.artwork!, {
                fallback: BACKGROUND_COLOR,
                cache: true,
                key: track.artwork,
                quality: 'lowest', // lowest quality extracts much faster without freezing JS thread
            })
                .then((colors) => {
                    if (!isMounted) return;
                    if (colors.platform === 'android') {
                        setDominantColor(colors.dominant || BACKGROUND_COLOR);
                        setVibrantColor(colors.vibrant || colors.dominant || BACKGROUND_COLOR);
                    } else if (colors.platform === 'ios') {
                        setDominantColor(colors.background || BACKGROUND_COLOR);
                        setVibrantColor(colors.primary || colors.secondary || BACKGROUND_COLOR);
                    } else {
                        setDominantColor(colors.vibrant || BACKGROUND_COLOR);
                        setVibrantColor(colors.lightVibrant || BACKGROUND_COLOR);
                    }
                })
                .catch((err) => {
                    console.warn('Gradient extraction failed:', err);
                    if (!isMounted) return;
                    setDominantColor(BACKGROUND_COLOR);
                    setVibrantColor(BACKGROUND_COLOR);
                });
        });

        return () => {
            isMounted = false;
            task.cancel();
        };
    }, [track?.artwork]);

    // Pre-calculate exact view height to prevent dynamic layout thrashing
    const primaryViewHeight = screenHeight - insets.top;

    return (
        <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
            {showVideo && track?.customVideoUri && videoPlayer && (
                <VideoView
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: screenHeight,
                        zIndex: 0,
                    }}
                    player={videoPlayer}
                    allowsPictureInPicture={false}
                    contentFit="cover"
                    nativeControls={false}
                />
            )}

            <LinearGradient
                colors={['rgba(18,18,18,0.05)', 'rgba(18,18,18,0.65)', BACKGROUND_COLOR]}
                locations={[0, 0.45, 1]}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: showVideo ? screenHeight : 0,
                    opacity: 0.95,
                    zIndex: 1,
                }}
            />

            <SafeAreaView className="flex-1 px-6 mb-10">
                <LinearGradient
                    colors={[vibrantColor, dominantColor, BACKGROUND_COLOR]}
                    locations={[0, 0.4, 1]}
                    style={{
                        position: 'absolute',
                        top: -insets.top,
                        left: -24,
                        right: -24,
                        height: showVideo ? 0 : screenHeight,
                        opacity: 0.8,
                    }}
                />

                <View style={{ height: primaryViewHeight }} className="justify-between pb-8">
                    <View className="flex-row justify-between items-center pt-2 pb-4">
                        <TouchableOpacity hitSlop={15} onPress={onClose}>
                            <ChevronDown size={28} color="#fff" />
                        </TouchableOpacity>

                        <View className="items-center">
                            <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                                Playing from playlist
                            </Text>
                            <Text className="text-white text-sm font-bold">
                                {playlistName ?? 'Playlist'}
                            </Text>
                        </View>

                        <TouchableOpacity hitSlop={15} onPress={handleAddToPlaylist}>
                            <EllipsisVertical size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 items-center justify-center py-16">
                        {!showVideo && track?.artwork ? (
                            // expo-image for zero-drop rendering
                            <Image
                                source={{ uri: track.artwork }}
                                style={{ width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                contentFit="cover"
                                transition={200}
                            />
                        ) : showVideo ? (
                            <View className="w-full aspect-square" />
                        ) : (
                            <View className="w-16 h-16 rounded-sm bg-slate-100 items-center justify-center">
                                <Music size={24} color="#A1A1AA" />
                            </View>
                        )}
                    </View>

                    <TrackController track={track} />

                    <View className="flex-row justify-between items-center mt-6">
                        {track?.customVideoUri ? (
                            <TouchableOpacity hitSlop={12} onPress={handleShowView}>
                                <Hd size={20} opacity={showVideo ? 1 : 0.5} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <Hd size={20} color="white" opacity={0.2} />
                        )}
                        <TouchableOpacity hitSlop={12} onPress={setOpenPlayListMenu}>
                            <ListFilter size={20} color="white" opacity={0.8} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Lyrics color={vibrantColor} />

                {!!track?.youtube_uri && (
                    <View className="my-6">
                        <Text className="text-white font-bold text-lg mb-4">Youtube Reference</Text>
                        <YouTubeEmbed id={track.youtube_uri} />
                    </View>
                )}
            </SafeAreaView>
            <AddToPlayList isVisible={openAddToPlaylist} musicId={track?.id ?? ''} onClose={handleAddToPlaylist} />
        </View>
    );
}