// Copyright (c) 2026 Raj
// See LICENSE for details.

import { Image } from "react-native";

export const defaultMusicArtWork: string = Image.resolveAssetSource(
  require("@/assets/arise/arise.png"),
).uri;

export const defaultVideo: string = Image.resolveAssetSource(
  require("@/assets/video/sample1.mp4"),
).uri;

export const defaultPlayListCover: string =
  "https://res.cloudinary.com/dcyn3ewpv/image/upload/v1780313890/default-playlist_krm5zv.png";

export const defaultPlayList = 'default'
