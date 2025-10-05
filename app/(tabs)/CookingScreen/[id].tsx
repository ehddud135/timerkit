import { getData, storeData } from '@/hooks/storage'; // 경로 확인
import { Recipe, TimerStep } from '@/hooks/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAudio } from '../../../contexts/AudioContext'; // 경로 확인

const STORAGE_KEY = '@TimerKit:recipes';

type TimerStatus = 'idle' | 'running' | 'paused' | 'finished' | 'done';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { playAll } = useAudio();

  // 1. 모든 레시피 정보를 이 'recipe' 상태 하나로만 관리합니다. (가장 큰 변경점)
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<number | null>(null);

  // 화면이 열릴 때 ID에 해당하는 레시피 데이터를 불러오는 로직
  useEffect(() => {
    const loadRecipe = async () => {
      const allRecipes = await getData<Recipe[]>(STORAGE_KEY) || [];
      const foundRecipe = allRecipes.find(r => r.id === id);

      if (foundRecipe) {
        setRecipe(foundRecipe);
        setCurrentTime(foundRecipe.timers[0]?.duration || 0);
      } else {
        const newRecipe: Recipe = {
          id: id!,
          name: '새로운 요리',
          memo: '여기에 레시피를 적어보세요.',
          timers: [{ id: Date.now(), stepName: '1단계', duration: 60 }],
        };
        setRecipe(newRecipe);
        setCurrentTime(60);
      }
    };
    loadRecipe();
  }, [id]);

  // 'recipe' 상태가 변경될 때마다 자동으로 AsyncStorage에 저장하는 로직
  useEffect(() => {
    if (recipe) {
      const saveRecipe = async () => {
        const allRecipes = await getData<Recipe[]>(STORAGE_KEY) || [];
        const recipeIndex = allRecipes.findIndex((r: Recipe) => r.id === recipe.id);

        if (recipeIndex > -1) {
          allRecipes[recipeIndex] = recipe;
        } else {
          allRecipes.push(recipe);
        }
        await storeData(STORAGE_KEY, allRecipes);
      };
      const debounce = setTimeout(() => saveRecipe(), 500);
      return () => clearTimeout(debounce);
    }
  }, [recipe]);

  // 타이머 실행/정지 로직
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  // 시간이 다 되었을 때 다음 단계로 넘어가는 로직
  useEffect(() => {
    if (currentTime < 0 && recipe) { // 2. recipe가 있는지 확인
      playAll();
      if (currentStepIndex >= recipe.timers.length - 1) { // 'steps' 대신 'recipe.timers' 사용
        setStatus('done');
        Alert.alert('요리 완료!', `${recipe.name} 요리가 끝났습니다.`); // 'recipeName' 대신 'recipe.name' 사용
      } else {
        setStatus('finished');
      }
    }
  }, [currentTime, currentStepIndex, recipe, playAll]);

  // --- 버튼 핸들러 (모두 'recipe' 상태를 사용하도록 수정) ---
  const handleStart = () => {
    if (!recipe || recipe.timers.length === 0) return;
    setCurrentStepIndex(0);
    setCurrentTime(recipe.timers[0].duration);
    setStatus('running');
  };
  
  const handleNextStep = () => {
    if (!recipe) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < recipe.timers.length) {
      setCurrentStepIndex(nextIndex);
      setCurrentTime(recipe.timers[nextIndex].duration);
      setStatus('running');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setCurrentStepIndex(0);
    setCurrentTime(recipe?.timers[0]?.duration || 0);
  };
  
  const addStep = () => {
    // 3. setRecipe를 사용하여 timers 배열을 업데이트
    setRecipe((prev: Recipe | null) => {
      if (!prev) return null; // prev가 null일 경우를 대비한 방어 코드
      
      const newStep: TimerStep = {
        id: Date.now(),
        stepName: `새 단계 ${prev.timers.length + 1}`,
        duration: 60,
      };
      return { ...prev, timers: [...prev.timers, newStep] };
    });
  };

  // --- 렌더링 함수 ---
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 4. 데이터가 로딩되기 전에 화면이 깨지는 것을 방지
  if (!recipe) {
    return <View style={styles.container}><Text style={{color: 'white'}}>로딩 중...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TextInput 
        style={styles.recipeTitle} 
        value={recipe.name} 
        // 5. setRecipe를 사용하여 이름 업데이트
        onChangeText={(text) => setRecipe(prev => prev ? { ...prev, name: text } : null)} 
        editable={status === 'idle'} 
      />

      <View style={styles.mainTimerContainer}>
        <Text style={styles.stepName}>{recipe.timers[currentStepIndex]?.stepName || '대기 중'}</Text>
        <Text style={styles.mainTimerText}>
          {status === 'done' ? '완료!' : formatTime(Math.max(0, currentTime))}
        </Text>
      </View>
      
      <View style={styles.controls}>
        {status === 'idle' && <TouchableOpacity style={styles.button} onPress={handleStart}><Text style={styles.buttonText}>요리 시작</Text></TouchableOpacity>}
        {status === 'running' && <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={() => setStatus('paused')}><Text style={styles.buttonText}>일시정지</Text></TouchableOpacity>}
        {status === 'paused' && <TouchableOpacity style={styles.button} onPress={() => setStatus('running')}><Text style={styles.buttonText}>계속</Text></TouchableOpacity>}
        {status === 'finished' && <TouchableOpacity style={styles.button} onPress={handleNextStep}><Text style={styles.buttonText}>다음 단계</Text></TouchableOpacity>}
        {status !== 'idle' && <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}><Text style={styles.buttonText}>초기화</Text></TouchableOpacity>}
      </View>

      <ScrollView style={styles.stepsContainer}>
        {recipe.timers.map((step, index) => (
          <View key={step.id} style={[styles.stepItem, index === currentStepIndex && status !== 'idle' && styles.activeStep]}>
            <Text style={styles.stepItemText}>{index + 1}. {step.stepName}</Text>
            <Text style={styles.stepItemText}>{formatTime(step.duration)}</Text>
          </View>
        ))}
        {status === 'idle' && (
          <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
            <Ionicons name="add-circle-outline" size={24} color="#3498db" />
            <Text style={styles.addStepButtonText}>타이머 단계 추가</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ... 스타일 코드는 동일
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e', padding: 20, paddingTop: 60 },
  recipeTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  mainTimerContainer: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  stepName: { color: '#a0a0a0', fontSize: 24, textTransform: 'uppercase', marginBottom: 10 },
  mainTimerText: { color: '#fff', fontSize: 80, fontWeight: '200', fontVariant: ['tabular-nums'] },
  controls: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  button: { backgroundColor: '#3498db', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, marginHorizontal: 10 },
  pauseButton: { backgroundColor: '#f39c12' },
  resetButton: { backgroundColor: '#95a5a6' },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  stepsContainer: { flex: 3, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  stepItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 5, marginBottom: 10 },
  activeStep: { backgroundColor: '#3498db' },
  stepItemText: { color: '#fff', fontSize: 18 },
  addStepButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 5, borderWidth: 1, borderColor: '#3498db', borderStyle: 'dashed' },
  addStepButtonText: { color: '#3498db', fontSize: 18, marginLeft: 10 },
});