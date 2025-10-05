import { useAudioPlayer } from 'expo-audio';
import React, { createContext, ReactNode, useCallback, useContext } from 'react';
import { Vibration } from 'react-native';

// Context가 제공할 기능들의 타입을 정의합니다.
interface AudioContextType {
  playAudio: () => void;
  playHaptic: () => void;
  playAll: () => void; // playAudio와 playHaptic을 동시에 실행
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// 다른 컴포넌트에서 쉽게 Context를 사용할 수 있게 해주는 커스텀 훅
export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

// 앱 전체를 감싸서 오디오/햅틱 기능을 제공할 Provider 컴포넌트
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioPlayer = useAudioPlayer(require('../assets/sounds/beep.mp3'));

  // --- 오디오만 재생하는 함수 ---
  const playAudio = useCallback(async () => {
    await audioPlayer.pause();
    await audioPlayer.seekTo(0);
    await new Promise(r => setTimeout(r, 50));
    await audioPlayer.play();
  }, [audioPlayer]);

  // --- 햅틱(진동)만 실행하는 함수 ---
  const playHaptic = useCallback(() => {
    Vibration.vibrate(1000);
  }, []);

  // --- 오디오와 햅틱을 모두 실행하는 함수 ---
  const playAll = useCallback(() => {
    playHaptic();
    playAudio();
  }, [playHaptic, playAudio]);

  // 제공할 함수들을 value 객체에 담습니다.
  const value = {
    playAudio,
    playHaptic,
    playAll,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}