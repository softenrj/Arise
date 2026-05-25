// Copyright (c) 2026 Raj
// See LICENSE for details.

import { IMusicTrack } from "@/types/database";
import { Track } from "react-native-track-player";

export function getTrackFromMusic(musics: IMusicTrack[]): Track[] {
    return musics.map((music: IMusicTrack, _) => ({
        id: music.id.toString(),
        url: music.uri,
        title: music.filename,
        artist: music.artist,
        artwork: music.customCoverUri || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVyKaoQcjUPMj6Abi-Y0xR_z21a25rbVr_yg&s',
        duration: music.duration || 0,
        mediaId: music.id
    }))
} 