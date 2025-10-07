import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

const TimerModule: undefined | { start(endTimeMs: number, title: string): void; stop(): void } =
  (NativeModules as any)?.TimerModule;
const BACKGROUND_TASK_NAME = 'background-timer-task';
const STORAGE_KEY = '@TimerKit:background-timer';

interface NotificationContextType {
  startTimerNotification: (title: string, durationInSeconds: number) => Promise<void>;
  stopTimerNotification: () => Promise<void>;
  updateTimerNotification: (title: string, body: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const configure = async () => {
      // 위치 및 알림 권한 요청
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        await Location.requestBackgroundPermissionsAsync();
      }
      await Notifications.requestPermissionsAsync();
    };
    configure();
  }, []);

  // [Android] Foreground Service 시작
  const startTimerNotification = async (durationInSeconds: number, title: string) => {
    if (Platform.OS === 'android') {
        TimerModule.start(durationInSeconds, title);
    }
  };

  // 알림 내용 업데이트 (새로 추가된 함수)
  const updateTimerNotification = async (title: string, body: string) => {
    if (Platform.OS === 'android') {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: 'timer-foreground-notification',
          content: {
            title: title,
            body: body,
            sticky: true,
          },
          trigger: null,
        });
      } catch (error) {
        console.error('Failed to update notification:', error);
      }
    }
  };

  // Foreground Service 중지 및 예약된 알림 취소
  const stopTimerNotification = async () => {
    if (Platform.OS === 'android') {
        TimerModule.stop();
    }
  };

  const value = {
    startTimerNotification,
    stopTimerNotification,
    updateTimerNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
