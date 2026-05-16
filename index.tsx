import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./service/trackPlayerServices";

export default function App() {
    const ctx = require.context("./app");
    return <ExpoRoot context={ctx} />
}

TrackPlayer.registerPlaybackService(() => PlaybackService)

registerRootComponent(App);
