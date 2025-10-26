import TimePickerModal from '@/components/ui/TimePickerModal';
import { useAudio } from '@/contexts/AudioContext';
import { getData, storeData } from '@/hooks/storage';
import { Workout } from '@/hooks/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


const STORAGE_KEY = '@TimerKit:tabataWorkouts';
// 각 상태를 정의합니다.
type TimerState = 'idle' | 'prepare' | 'work' | 'rest' | 'paused' | 'done';

const TabataTimerScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  // const [prepareTime, setPrepareTime] = useState(10);
  // const [workTime, setWorkTime] = useState(20);
  // const [restTime, setRestTime] = useState(10);
  // const [rounds, setRounds] = useState(8);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [pausedState, setPausedState] = useState<TimerState>('prepare'); // 일시정지 전 상태 저장
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { playAudio, playHaptic } = useAudio();
  const isTimerRunning = timerState === 'prepare' || timerState === 'work' || timerState === 'rest';
  const [modalVisible, setModalVisible] = useState(false);
  
  const [editingTime, setEditingTime] = useState<{ type: 'prepare' | 'work' | 'rest'; value: number } | null>(null);
  const [work, setWork] = useState<Workout | null> (null)
  const workRef = useRef(work);
  const openPicker = (type: 'prepare' | 'work' | 'rest', value: number) => {
    setEditingTime({ type, value });
    setModalVisible(true);
  };

  useEffect(() => { workRef.current = work; }, [work]);

  useEffect(() => {
      const loadRountines = async () => {
        const allRoutines = await getData<Workout[]>(STORAGE_KEY) || [];
        const foundRoutines = allRoutines.find(r => r.id === id);
  
        if (foundRoutines) {
          setWork(foundRoutines);
        } else {
          const newWorkout: Workout = {
            id: id!,
            name: '새로운 운동 루틴',
            prepare: 10,
            work: 20,
            rest: 10,
            rounds: 8,
          };
          setWork(newWorkout);
        }
      };
      loadRountines();
    }, [id]);

  const handleSaveTime = (newTime: number) => {
    if (editingTime) {
      setWork(prevWork => {
        if (!prevWork) return null;
        // 'work' 객체 안의 해당 속성([editingTime.type])을 업데이트
        return { ...prevWork, [editingTime.type]: newTime };
      });
    }
    setModalVisible(false);
  };

  const handleRoundsChange = (amount: number) => {
    setWork(prevWork => {
      if (!prevWork) return null;
      return { ...prevWork, rounds: Math.max(1, prevWork.rounds + amount) };
    });
  };

  const handleSave = useCallback(async () => {
    const currentWorkout = workRef.current; // state 대신 ref에서 최신 값을 가져옴
    if (currentWorkout) {
      const allWorkouts = await getData<Workout[]>(STORAGE_KEY) || [];
      const workoutIndex = allWorkouts.findIndex(r => r.id === currentWorkout.id);
      if (workoutIndex > -1) {
        allWorkouts[workoutIndex] = currentWorkout;
      } else {
        allWorkouts.push(currentWorkout);
      }
      await storeData(STORAGE_KEY, allWorkouts);
      router.back();
    }
  }, []);


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleSave}>
            <Ionicons name="save" size={28} color="#3498db" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleSave]);

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
    if (isTimerRunning && [3, 2, 1].includes(currentTime)) playAudio();
    if (isTimerRunning && currentTime === 0) playHaptic();
    if (currentTime < 0 && work) {
      // 다음 상태로 전환
      switch (timerState) {
        case 'prepare':
          setTimerState('work');
          setCurrentTime(work.work);
          break;
        case 'work':
          if (currentRound < work.rounds) {
            setTimerState('rest');
            setCurrentTime(work.rest);
          } else {
            setTimerState('done');
            Alert.alert("운동 완료!", "수고하셨습니다!");
          }
          break;
        case 'rest':
          setCurrentRound(prev => prev + 1);
          setTimerState('work');
          setCurrentTime(work.work);
          break;
      }
    }
  }, [currentTime, timerState, work, currentRound, playAudio, playHaptic, isTimerRunning]); // 'work' 의존성 추가

  const handleStart = () => {
    if (!work) return;
    setCurrentTime(work?.prepare);
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
    setCurrentTime(work?.prepare || 0);
    setCurrentRound(1);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isEditable = timerState === 'idle';

  if (!work) {
    return <View style={styles.container}><Text style={{color: 'white'}}>로딩 중...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.timerDisplay}>
        <TextInput 
          style={styles.Title} 
          value={work.name} 
          // 5. setRecipe를 사용하여 이름 업데이트
          onChangeText={(text) => setWork(prev => prev ? { ...prev, name: text } : null)} 
          editable={timerState === 'idle'} 
        />
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
          {timerState !== 'idle' && timerState !== 'done' ? `${currentRound} / ${work.rounds} 라운드` : ''}
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
          onPress={() => isEditable && openPicker('prepare', work.prepare)}
          disabled={!isEditable}
        >
          <Text style={styles.settingLabel}>준비</Text>
          <Text style={styles.settingValue}>{work.prepare}초</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={() => isEditable && openPicker('work', work.work)}
          disabled={!isEditable}
        >
          <Text style={styles.settingLabel}>운동</Text>
          <Text style={styles.settingValue}>{work.work}초</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={() => isEditable && openPicker('rest', work.rest)}
          disabled={!isEditable}
        >
          <Text style={styles.settingLabel}>휴식</Text>
          <Text style={styles.settingValue}>{work.rest}초</Text>
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
            <Text style={styles.stepperValue}>{work.rounds}</Text>
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
  Title: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 0, 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
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
    color: '#ffffffff',
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
    color: '#f1eaeaff',
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
