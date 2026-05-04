import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from "expo-font";
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    ElmsSans_400: require('@/assets/font/ElmsSans-Regular.ttf'),
    ElmsSans_500: require('@/assets/font/ElmsSans-Medium.ttf'),
    ElmsSans_700: require('@/assets/font/ElmsSans-Bold.ttf'),

    OldStandT_400: require('@/assets/font/OldStandardTT-Regular.ttf'),
    OldStandT_700: require('@/assets/font/OldStandardTT-Bold.ttf'),
  });
  const colorScheme = useColorScheme();

  if (!fontsLoaded) return null;

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <GluestackUIProvider mode="dark" style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </GluestackUIProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}