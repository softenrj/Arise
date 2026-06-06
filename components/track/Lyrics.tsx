import { useMusic } from '@/hooks/useMusic';
import { useAppSelector } from '@/hooks/useRedux';
import { LyricLine, LyricsService } from '@/service/lyrics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useProgress } from 'react-native-track-player';

const AnimatedLyricText = React.memo(
    ({ text, isActive }: { text: string; isActive: boolean }) => {
        const animatedStyle = useAnimatedStyle(() => {
            return {
                opacity: withTiming(isActive ? 1 : 0.3, { duration: 300 }),
                transform: [
                    { scale: withSpring(isActive ? 1.04 : 0.90, { damping: 15, stiffness: 150 }) }
                ]
            };
        }, [isActive]);

        return (
            <Animated.Text
                className={`text-white font-elms-bold ${isActive ? 'text-3xl' : 'text-2xl'} text-center`}
                style={[animatedStyle, { paddingVertical: 12 }]}
            >
                {text}
            </Animated.Text>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.isActive === nextProps.isActive && prevProps.text === nextProps.text;
    }
);

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<LyricLine>);

export default function Lyrics({ color }: { color: string }) {
    const { queue, currentIndex } = useAppSelector((state) => state.trackReducer);
    const { position } = useProgress();
    const track = queue[currentIndex];
    const { filteredMusic } = useMusic();

    // console.log(filteredMusic)

    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const flatListRef = useRef<FlatList<LyricLine>>(null);

    const handleLoadLyrics = useCallback(async () => {
        if (track?.lyricsUri) {
            const loadedLyrics = await LyricsService.loadLyricsFromFile(track.lyricsUri);
            setLyrics(loadedLyrics);
        }
    }, [track]);

    useEffect(() => {
        handleLoadLyrics();
    }, [track]);

    const activeIndex = useMemo(() => {
        if (!lyrics || lyrics.length === 0) return 0;
        const currentMs = position * 1000;

        const index = lyrics.findIndex((lyric, i) => {
            const nextLyric = lyrics[i + 1];
            if (nextLyric) {
                return currentMs >= lyric.time && currentMs < nextLyric.time;
            }
            return currentMs >= lyric.time;
        });

        return index !== -1 ? index : 0;
    }, [position, lyrics]);

    useEffect(() => {
        if (flatListRef.current && lyrics.length > 0 && activeIndex >= 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: activeIndex,
                    animated: true,
                    viewPosition: 0.5,
                });
            }, 100);
        }
    }, [activeIndex, lyrics.length, isExpanded]);

    return (
        <>
            <View
                className='w-full p-5 rounded-2xl'
                style={{ backgroundColor: color, overflow: 'hidden' }}
            >
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.15)', 'transparent']}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className='absolute inset-0'
                />

                <Text className="text-white font-bold text-lg z-10">Lyrics</Text>

                <View className='py-4 h-[300px] overflow-hidden'>
                    <AnimatedFlatList
                        ref={!isExpanded ? flatListRef : null}
                        scrollEnabled={false}
                        data={lyrics}
                        keyExtractor={(_, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingTop: 120,
                            paddingBottom: 120,
                        }}
                        onScrollToIndexFailed={(info) => {
                            const offset = info.averageItemLength * info.index;
                            flatListRef.current?.scrollToOffset({ offset, animated: true });
                        }}
                        renderItem={({ item, index }) => (
                            <AnimatedLyricText
                                text={item.text}
                                isActive={index === activeIndex}
                            />
                        )}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={false}
                    />
                </View>

                <Pressable className="bg-white/20 px-2 py-1.5 w-[7.5rem] justify-center items-center rounded-full mt-6">
                    <TouchableOpacity onPress={() => setIsExpanded(true)}>
                        <Text className="text-white text-sm font-elms-bold">Show Lyrics</Text>
                    </TouchableOpacity>
                </Pressable>
            </View>

            <Modal visible={isExpanded} animationType="slide" transparent={true}>
                <View className="flex-1" style={{ backgroundColor: color }}>
                    <LinearGradient
                        colors={['rgba(0, 0, 0, 0.65)', 'rgba(0, 0, 0, 0.25)', 'transparent']}
                        locations={[0, 0.5, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className='absolute inset-0'
                    />

                    <SafeAreaView className="flex-1 m-5 mt-10">
                        <Text className="text-white font-bold text-2xl z-10 text-center mb-6">Lyrics</Text>

                        <View className="flex-1 overflow-hidden">
                            <AnimatedFlatList
                                ref={isExpanded ? flatListRef : null}
                                scrollEnabled={true}
                                data={lyrics}
                                keyExtractor={(_, index) => index.toString()}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingTop: 300,
                                    paddingBottom: 300,
                                }}
                                onScrollToIndexFailed={(info) => {
                                    const offset = info.averageItemLength * info.index;
                                    flatListRef.current?.scrollToOffset({ offset, animated: true });
                                }}
                                renderItem={({ item, index }) => (
                                    <AnimatedLyricText
                                        text={item.text}
                                        isActive={index === activeIndex}
                                    />
                                )}
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                                removeClippedSubviews={false}
                            />
                        </View>

                        <Pressable className="bg-white/20 px-2 py-3 w-[8.5rem] justify-center items-center rounded-full mt-6 self-center mb-4">
                            <TouchableOpacity onPress={() => setIsExpanded(false)}>
                                <Text className="text-white text-sm font-elms-bold">Close Lyrics</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </SafeAreaView>
                </View>
            </Modal>
        </>
    );
}