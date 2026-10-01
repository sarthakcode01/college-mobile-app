import {
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { StoreProvider } from '@/lib/store';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, or unavailable on this platform — safe to ignore.
});

export default function RootLayout() {
  const t = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_700Bold,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // Render regardless of font state so a font failure never blocks the app.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <StoreProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </StoreProvider>
  );
}
