// Copyright (c) 2026 Raj
// See LICENSE for details.

import { createMultipleMusics } from '@/service/database';
import * as MediaLibrary from 'expo-media-library';
import { useSQLiteContext } from 'expo-sqlite';
import { CheckCircle2, Music2, RefreshCw, ScanLine, ShieldAlert } from 'lucide-react-native';
import React from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { ScanState } from '.';
import { ProgressBar, StatCard } from './utils';


export default function ScanMusic({ scanState, setScanState }: { scanState: ScanState, setScanState: (action: ScanState) => void }) {
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    const [scannedCount, setScannedCount] = React.useState(0);
    const [totalCount, setTotalCount] = React.useState(0);
    const [progress, setProgress] = React.useState(0);
    const [errorMsg, setErrorMsg] = React.useState('');

    const mountFade = React.useRef(new Animated.Value(0)).current;
    const ringScale = React.useRef(new Animated.Value(1)).current;
    const ringOpacity = React.useRef(new Animated.Value(0)).current;
    const iconPulse = React.useRef(new Animated.Value(1)).current;
    const checkPop = React.useRef(new Animated.Value(0)).current;
    const counterFade = React.useRef(new Animated.Value(0)).current;

    const db = useSQLiteContext();

    React.useEffect(() => {
        Animated.timing(mountFade, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }, []);

    React.useEffect(() => {
        if (scanState === 'scanning') {
            counterFade.setValue(0);
            Animated.timing(counterFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();

            const pulse = Animated.loop(Animated.sequence([
                Animated.timing(iconPulse, { toValue: 1.1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(iconPulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ]));
            pulse.start();

            const ring = Animated.loop(Animated.parallel([
                Animated.timing(ringScale, { toValue: 1.6, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.sequence([
                    Animated.timing(ringOpacity, { toValue: 0.6, duration: 200, useNativeDriver: true }),
                    Animated.timing(ringOpacity, { toValue: 0, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                ]),
            ]));
            ring.start();

            return () => { pulse.stop(); ring.stop(); iconPulse.setValue(1); };
        }

        if (scanState === 'done') {
            ringScale.setValue(1);
            ringOpacity.setValue(0);
            iconPulse.setValue(1);
            checkPop.setValue(0);
            Animated.spring(checkPop, { toValue: 1, tension: 65, friction: 7, useNativeDriver: true }).start();
        }
    }, [scanState]);

    async function handleScan() {
        if (permissionResponse?.status !== 'granted') {
            const result = await requestPermission();
            if (result.status !== 'granted') {
                setScanState('error');
                setErrorMsg('Media library access was denied.');
                return;
            }
        }

        setScanState('scanning');
        setScannedCount(0);
        setTotalCount(0);
        setProgress(0);
        setErrorMsg('');

        try {
            let hasNextPage = true;
            let after: string | undefined = undefined;
            let musics: MediaLibrary.Asset[] = []; // Typed for safety
            let total = 0;
            let knownTotal = 0;

            while (hasNextPage) {
                const result = await MediaLibrary.getAssetsAsync({ mediaType: MediaLibrary.MediaType.audio, first: 50, after });

                if (knownTotal === 0 && result.totalCount > 0) {
                    knownTotal = result.totalCount;
                    setTotalCount(knownTotal);
                }

                // FIXED: Spread the assets to keep the array flat
                musics.push(...result.assets);

                total += result.assets.length;
                setScannedCount(total);
                setProgress(knownTotal > 0 ? total / knownTotal : 0);
                hasNextPage = result.hasNextPage;
                after = result.endCursor;
            }

            setScanState('done');
            await createMultipleMusics(musics as any, db);
        } catch (e: any) {
            setScanState('error');
            setErrorMsg(e?.message ?? 'Something went wrong.');
        }
    }

    function handleReset() {
        setScanState('idle');
        setScannedCount(0);
        setTotalCount(0);
        setProgress(0);
        checkPop.setValue(0);
    }

    const pct = Math.round(progress * 100);
    const needsPermission = permissionResponse?.status !== 'granted';
    const isLimited = permissionResponse?.accessPrivileges === 'limited';

    return (
        <View className='flex-1 items-center justify-center p-6'>
            {scanState !== 'done' && (
                <View className="w-[100px] h-[100px] items-center justify-center mb-8 mt-10">
                    <Animated.View
                        className={`absolute w-[100px] h-[100px] rounded-full border-[1.5px] ${scanState === 'scanning' ? 'border-[#4F8EF7]' : 'border-emerald-500'}`}
                        style={{ transform: [{ scale: ringScale }], opacity: ringOpacity }}
                    />

                    <Animated.View
                        className={`w-[88px] h-[88px] rounded-full items-center justify-center border-[1px] ${scanState === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                            }`}
                        style={{ transform: [{ scale: iconPulse }] }}
                    >
                        {scanState === 'scanning' ? (
                            <ScanLine size={40} color="#4F8EF7" />
                        ) : (
                            <Music2 size={40} color={scanState === 'error' ? '#EF4444' : '#4F8EF7'} />
                        )}
                    </Animated.View>
                </View>
            )}

            {scanState === 'idle' && (
                <View className="w-full items-center">
                    <Text className="text-slate-900 text-3xl font-[elms-bold] mb-2.5">Scan Music</Text>
                    <Text className="text-slate-500 text-sm font-[elms] text-center leading-[22px] mb-7">
                        Discover all audio tracks on your{'\n'}device and add them to your library.
                    </Text>

                    {needsPermission && (
                        <View className="flex-row items-center gap-[6px] bg-amber-50 rounded-[10px] px-3.5 py-2 mb-5">
                            <ShieldAlert size={13} color="#F59E0B" />
                            <Text className="text-amber-600 text-xs font-[elms]">Permission required to scan</Text>
                        </View>
                    )}

                    {isLimited && (
                        <View className="flex-row items-center gap-[6px] bg-amber-50 rounded-[10px] px-3.5 py-2 mb-5">
                            <ShieldAlert size={13} color="#F59E0B" />
                            <Text className="text-amber-600 text-xs font-[elms]">Limited access — some files may be missed</Text>
                        </View>
                    )}

                    <Pressable
                        onPress={handleScan}
                        className="flex-row items-center justify-center bg-[#4F8EF7] rounded-[14px] py-[15px] w-full mt-1 active:opacity-80 active:scale-95 transition-all"
                    >
                        <ScanLine size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text className="text-white text-[15px] font-[elms-med] tracking-[0.2px]">Scan Now</Text>
                    </Pressable>
                </View>
            )}

            {scanState === 'scanning' && (
                <Animated.View className="w-full items-center" style={{ opacity: counterFade }}>
                    <View className="flex-row items-center gap-[7px] bg-blue-50 rounded-[20px] px-3.5 py-1.5 mb-5">
                        <View className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7]" />
                        <Text className="text-[#4F8EF7] text-[11px] font-[elms-med] tracking-[1.5px] uppercase">Scanning</Text>
                    </View>

                    <Text className="text-slate-900 text-6xl font-[elms-bold] leading-[72px] tracking-[-2px]">{scannedCount.toLocaleString()}</Text>
                    <Text className="text-slate-500 text-sm font-[elms] mb-7 mt-1">{totalCount > 0 ? `of ${totalCount.toLocaleString()} tracks` : 'tracks found…'}</Text>

                    <View className="w-full gap-2">
                        <ProgressBar progress={progress} />
                        <View className="flex-row justify-between">
                            <Text className="text-slate-500 text-[11px] font-[elms]">{totalCount > 0 ? `${pct}%` : 'Discovering…'}</Text>
                            {totalCount > 0 && <Text className="text-slate-500 text-[11px] font-[elms]">{scannedCount.toLocaleString()} / {totalCount.toLocaleString()}</Text>}
                        </View>
                    </View>
                </Animated.View>
            )}

            {scanState === 'done' && (
                <View className="w-full items-center">
                    <View className="flex-row items-center gap-[7px] bg-emerald-50 rounded-[20px] px-3.5 py-1.5 mb-5">
                        <CheckCircle2 size={11} color="#10B981" />
                        <Text className="text-emerald-500 text-[11px] font-[elms-med] tracking-[1.5px] uppercase">Complete</Text>
                    </View>

                    <Text className="text-slate-900 text-6xl font-[elms-bold] leading-[72px] tracking-[-2px]">{scannedCount.toLocaleString()}</Text>
                    <Text className="text-slate-500 text-sm font-[elms] mb-7 mt-1">tracks discovered</Text>

                    <View className="flex-row gap-2.5 w-full mb-6 mt-2">
                        <StatCard label="Scanned" value={scannedCount.toLocaleString()} colorClass="text-[#4F8EF7]" />
                        <StatCard label="Progress" value="100%" colorClass="text-[#10B981]" />
                    </View>

                    <Pressable
                        onPress={handleReset}
                        className="flex-row items-center justify-center border-[0.5px] border-slate-200 rounded-[14px] py-[14px] w-full mt-2 active:bg-slate-100"
                    >
                        <RefreshCw size={15} color="#64748B" style={{ marginRight: 8 }} />
                        <Text className="text-slate-600 text-sm font-[elms-med]">Rescan Library</Text>
                    </Pressable>
                </View>
            )}

            {scanState === 'error' && (
                <View className="w-full items-center">
                    <Text className="text-red-500 text-[22px] font-[elms-med] mb-2">Scan Failed</Text>
                    {errorMsg ? <Text className="text-slate-500 text-[13px] font-[elms] text-center mb-6">{errorMsg}</Text> : null}
                    <Pressable onPress={handleScan} className="flex-row items-center justify-center bg-[#4F8EF7] rounded-[14px] py-[15px] w-full mt-1 active:opacity-80">
                        <Text className="text-white text-[15px] font-[elms-med] tracking-[0.2px]">Try Again</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}