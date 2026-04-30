import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from "expo-font";
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import "../global.css";

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    ElmsSans: require('@/assets/font/ElmsSans-Regular.ttf'),
    OldStandT: require('@/assets/font/OldStandardTT-Regular.ttf'),
  })
  const colorScheme = useColorScheme();

  if (!fontsLoaded) null;
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
