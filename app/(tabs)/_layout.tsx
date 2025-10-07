import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { AudioProvider } from '@/contexts/AudioContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Tabs, usePathname, useRouter } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import React, { useEffect } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';

const BACKGROUND_TASK_NAME = 'background-timer-task';
const STORAGE_KEY = '@TimerKit:background-timer';

let taskInterval: number| null = null;

// 백그라운드 작업 정의
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  if (Platform.OS !== 'android') return;

  // 기존 interval이 있다면 클리어
  if (taskInterval) {
    clearInterval(taskInterval);
  }

  // 1초마다 실행될 로직
  taskInterval = setInterval(async () => {
    try {
      const dataStr = await AsyncStorage.getItem(STORAGE_KEY);
      if (dataStr == null) {
        if (taskInterval) clearInterval(taskInterval);
        return;
      }

      const data = JSON.parse(dataStr);
      const { endTime, title } = data;
      const remainingTime = Math.round((endTime - Date.now()) / 1000);

      if (remainingTime > 0) {
        // 알림 내용 업데이트
        await Notifications.scheduleNotificationAsync({
          identifier: 'timer-foreground-notification',
          content: {
            title: `${title} 타이머 실행 중`,
            body: `남은 시간: ${Math.floor(remainingTime/60).toString().padStart(2,'0')}:${(remainingTime%60).toString().padStart(2,'0')}`,
            sticky: true,
          },
          trigger: null,
        });
      } else {
        // 타이머 종료
        if (taskInterval) clearInterval(taskInterval);
        await Location.stopLocationUpdatesAsync(BACKGROUND_TASK_NAME);
        await Notifications.dismissNotificationAsync('timer-foreground-notification');
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Background task error:', error);
      if (taskInterval) clearInterval(taskInterval);
    }
  }, 1000);
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleBackButton = () => {
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
    <NotificationProvider>
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
    </NotificationProvider>
  );
}
