import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 6000);
  const seconds = Math.floor((time % 6000) / 100);
  const milliseconds = time % 100;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

export default function StopwatchScreen() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime +1 );
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleLapReset = () => {
    if (isRunning) {
      // 랩 타임 추가
      setLaps([time, ...laps]);
    } else {
      // 리셋
      setTime(0);
      setLaps([]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. 시간 표시 영역 */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
      </View>

      {/* 2. 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.lapButton]} onPress={handleLapReset}>
          <Text style={styles.buttonText}>{isRunning ? '랩' : '리셋'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, isRunning ? styles.stopButton : styles.startButton]} onPress={handleStartStop}>
          <Text style={styles.buttonText}>{isRunning ? '중지' : '시작'}</Text>
        </TouchableOpacity>
      </View>

      {/* 3. 랩 타임 목록 영역 */}
      <ScrollView style={styles.lapContainer}>
        {laps.map((lapTime, index) => (
          <View key={index} style={styles.lapItem}>
            <Text style={styles.lapText}>랩 {laps.length - index} :</Text>
            <Text style={styles.lapText}>{formatTime(lapTime)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 전체 화면을 차지하도록 설정
    backgroundColor: '#0D0D0D', // 어두운 배경색
  },
  timerContainer: {
    flex: 1, // 화면의 3/7 비율 차지
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 70,
    fontWeight: '200', // 얇은 폰트
    fontVariant: ['tabular-nums'],
  },
  buttonContainer: {
    flex: 1, // 화면의 1/7 비율 차지
    flexDirection: 'row', // 버튼을 가로로 배치
    justifyContent: 'space-around', // 버튼 사이에 동일한 간격
    alignItems: 'center',
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50, // 원형 버튼
    justifyContent: 'center',
    alignItems: 'center',
  },
  lapButton: {
    backgroundColor: '#3D3D3D',
  },
  startButton: {
    backgroundColor: '#06921bff',
  },
  stopButton: {
    backgroundColor: '#f50505ff'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  lapContainer: {
    flex: 3, // 화면의 3/7 비율 차지
    paddingHorizontal: 20,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderBottomColor: '#3D3D3D',
  },
  lapText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontVariant: ['tabular-nums'],
  },
});