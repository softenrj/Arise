// Copyright (c) 2026 Raj
// See LICENSE for details.

import { IMusicTrack } from "@/types/database";
import { defaultMusicArtWork } from "@/utils/constants";
import { Track } from "react-native-track-player";

export function getTrackFromMusic(musics: IMusicTrack[]): Track[] {
    return musics.map((music: IMusicTrack, _) => ({
        id: music.id.toString(),
        url: music.uri,
        title: music.filename,
        artist: music.artist,
        artwork: music.customCoverUri || defaultMusicArtWork,
        duration: music.duration || 0,
        mediaId: music.id
    }))
} 