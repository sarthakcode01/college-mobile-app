/**
 * Admin (TPO / Coordinator) tab navigator.
 * Mirrors the student layout — see the note there about why `Tabs` is used
 * instead of `NativeTabs`.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { glassTokens } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/lib/store';

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

export default function AdminLayout() {
  const t = useTheme();
  const scheme = useColorScheme();
  const { user } = useStore();
  const isDark = scheme !== 'light';
  const g = glassTokens(isDark);

  if (!user) return <Redirect href="/" />;
  if (user.role === 'student') return <Redirect href="/(student)/home" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.brand,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
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
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
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
        name="broadcasts"
        options={{
          title: 'Broadcasts',
          tabBarIcon: ({ color, size }) => <Ionicons name="megaphone" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />

      {/* Nested routes — registered but hidden from the tab bar. */}
      <Tabs.Screen name="drives/create" options={{ href: null }} />
      <Tabs.Screen name="drives/applicants" options={{ href: null }} />
    </Tabs>
  );
}