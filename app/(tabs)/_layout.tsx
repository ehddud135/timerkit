import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AudioProvider} from '@/contexts/AudioContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname(); // 2. 현재 경로를 가져오는 훅을 사용합니다.

  useEffect(() => {
    const handleBackButton = () => {
      if (pathname !== '/') {
        router.replace('/'); 
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton
    );
    return () => backHandler.remove();
  }, [pathname, router]);


  return (
    <AudioProvider>
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="StopwatchScreen"
        options={{
          title: 'StopWatch',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="stopwatch.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="TabataScreen"
        options={{
          title: 'Tabata',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dumbbell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="CookingScreen"
        options={{
          title: 'Cook',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="flame.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="RunningScreen"
        options={{
          title: 'Running',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.run" color={color} />,
        }}
      />
    </Tabs>
    </AudioProvider>
  );
}
