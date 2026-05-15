// Copyright (c) 2026 Raj 
// See LICENSE for details.

export interface IMusicTrack {
    id: string;
    albumId: string | null;
    filename: string;
    duration: number;
    creationTime: number;
    modificationTime: number;
    mediaType: 'audio' | string;
    height: number;
    width: number;

    customCoverUri?: string | null;
    isLiked?: 0 | 1;
    customVideoUri?: string | null;
}