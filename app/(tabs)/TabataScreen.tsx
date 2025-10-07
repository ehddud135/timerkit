import React, { useEffect, useRef, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TimePickerModal from '../../components/ui/TimePickerModal';
import { useAudio } from '../../contexts/AudioContext';

// 각 상태를 정의합니다.
type TimerState = 'idle' | 'prepare' | 'work' | 'rest' | 'paused' | 'done';

const TabataTimerScreen = () => {
  const [prepareTime, setPrepareTime] = useState(10);
  const [workTime, setWorkTime] = useState(20);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentTime, setCurrentTime] = useState(prepareTime);
  const [currentRound, setCurrentRound] = useState(1);
  const [pausedState, setPausedState] = useState<TimerState>('prepare'); // 일시정지 전 상태 저장
  const intervalRef = useRef<number | null>(null);
  const { playAudio, playHaptic } = useAudio();
  const isTimerRunning = timerState === 'prepare' || timerState === 'work' || timerState === 'rest';
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTime, setEditingTime] = useState<{ type: 'prepare' | 'work' | 'rest'; value: number } | null>(null);

  const openPicker = (type: 'prepare' | 'work' | 'rest', value: number) => {
    setEditingTime({ type, value });
    setModalVisible(true);
  };

  const handleSaveTime = (newTime: number) => {
    if (editingTime) {
      switch (editingTime.type) {
        case 'prepare':
          setPrepareTime(newTime);
          break;
        case 'work':
          setWorkTime(newTime);
          break;
        case 'rest':
          setRestTime(newTime);
          break;
      }
    }
    setModalVisible(false);
  };

  useEffect(() => {
    if (timerState === 'idle' || timerState === 'paused' || timerState === 'done') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  useEffect(() => {
    if (isTimerRunning && [2, 1, 0].includes(currentTime)) {
      playAudio();
    }
    if (isTimerRunning && currentTime === 0) {
      playHaptic();
    }
    if (currentTime < 0) {
      // 다음 상태로 전환
      switch (timerState) {
        case 'prepare':
          setTimerState('work');
          setCurrentTime(workTime);
          break;
        case 'work':
          if (currentRound < rounds) {
            setTimerState('rest');
            setCurrentTime(restTime);
          } else {
            setTimerState('done');
            Alert.alert("운동 완료!", "수고하셨습니다!");
          }
          break;
        case 'rest':
          setCurrentRound(prev => prev + 1);
          setTimerState('work');
          setCurrentTime(workTime);
          break;
      }
    }
  }, [currentTime, timerState, workTime, restTime, rounds, currentRound, playAudio, playHaptic, isTimerRunning]);

  const handleStart = () => {
    setCurrentTime(prepareTime);
    setCurrentRound(1);
    setTimerState('prepare');
  };

  const handlePause = () => {
    // 현재 상태를 저장하고 일시정지
    setPausedState(timerState);
    setTimerState('paused');
  };

  const handleResume = () => {
    // 저장된 상태로 복귀
    setTimerState(pausedState);
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState('idle');
    setCurrentTime(prepareTime);
    setCurrentRound(1);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRoundsChange = (amount: number) => {
    setRounds(prev => Math.max(1, prev + amount));
  };

  const isEditable = timerState === 'idle';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.timerDisplay}>
        <Text style={styles.statusText}>
          {timerState === 'idle' && '준비'}
          {timerState === 'prepare' && '준비'}
          {timerState === 'work' && '운동'}
          {timerState === 'rest' && '휴식'}
          {timerState === 'paused' && '일시정지'}
          {timerState === 'done' && '완료'}
        </Text>
        <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
        <Text style={styles.roundText}>
          {timerState !== 'idle' && timerState !== 'done' ? `${currentRound} / ${rounds} 라운드` : ''}
        </Text>
      </View>

      <View style={styles.controls}>
        {timerState === 'idle' && (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>시작</Text>
          </TouchableOpacity>
        )}
        {(timerState === 'prepare' || timerState === 'work' || timerState === 'rest') && (
          <TouchableOpacity style={styles.button} onPress={handlePause}>
            <Text style={styles.buttonText}>일시정지</Text>
          </TouchableOpacity>
        )}
        {timerState === 'paused' && (
          <TouchableOpacity style={styles.button} onPress={handleResume}>
            <Text style={styles.buttonText}>계속</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>리셋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settings}>
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={() => isEditable && openPicker('prepare', prepareTime)}
          disabled={!isEditable}
        >
          <Text style={styles.settingLabel}>준비</Text>
          <Text style={styles.settingValue}>{prepareTime}초</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={() => isEditable && openPicker('work', workTime)}
          disabled={!isEditable}
        >
          <Text style={styles.settingLabel}>운동</Text>
          <Text style={styles.settingValue}>{workTime}초</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={() => isEditable && openPicker('rest', restTime)}
          disabled={!isEditable}
        >
          <Text style={styles.settingLabel}>휴식</Text>
          <Text style={styles.settingValue}>{restTime}초</Text>
        </TouchableOpacity>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>라운드</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleRoundsChange(-1)}
              disabled={!isEditable}
            >
              <Text style={styles.stepperButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{rounds}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleRoundsChange(1)}
              disabled={!isEditable}
            >
              <Text style={styles.stepperButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {editingTime && (
        <TimePickerModal
          visible={modalVisible}
          initialValue={editingTime.value}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveTime}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
  },
  timerDisplay: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 32,
    color: '#a0a0a0',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  timerText: {
    fontSize: 90,
    color: '#fff',
    fontWeight: '200',
    marginVertical: 10,
  },
  roundText: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  controls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  resetButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settings: {
    flex: 2,
    justifyContent: 'space-around',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#fff',
    fontSize: 18,
  },
  settingValue: {
    color: '#fff',
    fontSize: 18,
    padding: 5,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
  },
  stepperButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  stepperButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepperValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
});

export default TabataTimerScreen;
