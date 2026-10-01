/**
 * Student tab navigator.
 *
 * Uses the JS `Tabs` navigator rather than `NativeTabs` because detail routes
 * (drive detail, application tracker, experience detail) live *inside* these
 * tabs. `NativeTabs` only registers the screens declared as triggers, so a
 * `router.push` to a nested route silently does nothing. `Tabs` accepts those
 * routes as extra screens with `href={null}`, keeping them out of the tab bar
 * while remaining navigable.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { glassTokens } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/lib/store';

/** Frosted tab bar: blur + tint + top-edge sheen. */
function TabBarGlass({
  isDark,
  borderColor,
  topColor,
}: {
  isDark: boolean;
  borderColor: string;
  topColor: string;
}) {
  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <BlurView
        intensity={isDark ? 40 : 24}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? 'rgba(10,10,10,0.72)' : 'rgba(255,255,255,0.78)' },
        ]}
      />
      <LinearGradient
        colors={[topColor, 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', pointerEvents: 'none' }}
      />
      {/* Hairline top edge */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: StyleSheet.hairlineWidth * 2,
          backgroundColor: borderColor,
        }}
      />
    </View>
  );
}

export default function StudentLayout() {
  const t = useTheme();
  const scheme = useColorScheme();
  const { user } = useStore();
  const isDark = scheme !== 'light';
  const g = glassTokens(isDark);

  if (!user) return <Redirect href="/" />;
  if (user.role !== 'student') return <Redirect href="/(admin)/dashboard" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.brand,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
          // Translucent so the blur beneath reads as frosted glass.
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        sceneStyle: { backgroundColor: t.background },
        tabBarBackground: () => (
          <TabBarGlass isDark={isDark} borderColor={g.border} topColor={g.sheen} />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="drives/index"
        options={{
          title: 'Drives',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applications/index"
        options={{
          title: 'Applied',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prep/index"
        options={{
          title: 'Prep',
          tabBarIcon: ({ color, size }) => <Ionicons name="bulb" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />

      {/* Nested routes — registered but hidden from the tab bar. */}
      <Tabs.Screen name="drives/[id]" options={{ href: null }} />
      <Tabs.Screen name="applications/tracker" options={{ href: null }} />
      <Tabs.Screen name="prep/[id]" options={{ href: null }} />
    </Tabs>
  );
}