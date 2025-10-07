import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { AudioProvider } from '@/contexts/AudioContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, BackHandler, Platform, ToastAndroid } from 'react-native';



export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const backPressTime = useRef<number>(0);

  useEffect(() => {
    const handleBackButton = () => {
      if (pathname === '/') {
        const currentTime = Date.now();
        const timeDiff = currentTime - backPressTime.current;
        if (timeDiff < 2000) {
          BackHandler.exitApp();
          return true;
        } else {
          if (Platform.OS === 'android') {
            ToastAndroid.show("'뒤로' 버튼을 한번 더 누르시면 종료됩니다.", ToastAndroid.SHORT);
          }
          backPressTime.current = currentTime;
          return true;
        }
      }
      const targetTabs = ['/StopwatchScreen', '/TabataScreen', '/CookingScreen', '/RunningScreen'];
      if (targetTabs.includes(pathname)) {
        router.navigate('/');
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
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                Alert.alert('알림', '준비 중인 기능입니다.');
              },
            }}
          />
        </Tabs>
      </AudioProvider>
  );
}
