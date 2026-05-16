// Copyright (c) 2026 Raj 
// See LICENSE for details.

export interface IMusicTrack {
    id: string;
    uri: string;
    filename: string;
    duration: number;
    creationTime: number;
    modificationTime: number;
    mediaType: 'audio' | string;
    height: number;
    width: number;
    albumId: string | null;

    title: string | null;
    artist: string;
    album: string | null;
    albumArtist: string | null;
    trackNumber: number | null;
    year: number | null;
    artwork: string | null;

    isLiked?: 0 | 1;
    customCoverUri?: string | null;
    customVideoUri?: string | null;
}