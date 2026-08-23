// Copyright (c) 2026 Raj
// See LICENSE for details.

import { Image } from 'expo-image';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export const YouTubeEmbed = React.memo(({ id }: { id: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // YouTube automatically generates this thumbnail URL for every video
  const thumbnailUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  if (!isLoaded) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsLoaded(true)}
        className="w-full h-[175px] rounded-[6px] overflow-hidden my-4 items-center justify-center relative"
      >
        <Image
          source={{ uri: thumbnailUrl }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          contentFit="cover"
        />
      </TouchableOpacity>
    );
  }

  return (
    <View className="w-full rounded-[6px] overflow-hidden bg-[#050505] shadow-md my-4">
      <YoutubePlayer
        height={175}
        videoId={id}
        play={true} // Auto-play since they just tapped it
        initialPlayerParams={{
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
        }}
      />
    </View>
  );
});