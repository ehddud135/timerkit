import { getData, storeData } from '@/hooks/storage';
import { Workout } from '@/hooks/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STORAGE_KEY = '@TimerKit:tabataWorkouts';

const exampleWork: Workout = {
  id: `workout_${Date.now()}`,
  name: '운동 기본',
  prepare: 10,
  work: 20,
  rest: 10,
  rounds: 8,
};

export default function TabataListScreen() {
  const [works, setWorks] = useState<Workout[]>([]);
  const router = useRouter();
  useFocusEffect(
    React.useCallback(() => {
      const loadWorkList = async () => {
        try {
          const storedWorkLists = await getData<Workout[]>(STORAGE_KEY);
          if (storedWorkLists && storedWorkLists.length > 0) {
            setWorks(storedWorkLists);
          } else {
            const exampleData = [exampleWork];
            setWorks(exampleData);
            await storeData(STORAGE_KEY, exampleData);
          }
        } catch (e) {
          console.error('Failed to load or set recipes.', e);
        }
      };
      loadWorkList();
    }, [])
  );

  const handleAddNewWork = () => {
    const newWorkId = `workout_${Date.now()}`;
    router.push({
      pathname: '/TabataScreen/[id]',
      params: { id: newWorkId },
    });
  };

  const handleDeleteWork = (idToDelete: string) => {
    Alert.alert(
      "루틴 삭제",
      "정말로 이 루틴을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive", 
          onPress: async () => {
            const updatedWorkLists = works.filter(r => r.id !== idToDelete);
            setWorks(updatedWorkLists);
            await storeData(STORAGE_KEY, updatedWorkLists);
          } 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Routine List</Text>
      <FlatList
        data={works}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.workItem} 
            onPress={() => router.push({ pathname: '/TabataScreen/[id]', params: { id: item.id } })}
            onLongPress={() => handleDeleteWork(item.id)}
          >
            <Text style={styles.workName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>저장된 루틴이 없습니다.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewWork}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1e1e', paddingTop: 60 },
    title: { fontSize: 32, fontWeight: 'bold', color: 'white', paddingHorizontal: 20, marginBottom: 20 },
    workItem: { backgroundColor: '#333', padding: 20, marginHorizontal: 20, marginBottom: 10, borderRadius: 10 },
    workName: { color: 'white', fontSize: 18 },
    emptyText: { color: '#777', textAlign: 'center', marginTop: 50 },
    addButton: { position: 'absolute', right: 30, bottom: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});