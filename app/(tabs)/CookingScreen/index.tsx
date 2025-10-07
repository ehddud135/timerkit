import { getData, storeData } from '@/hooks/storage';
import { Recipe } from '@/hooks/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STORAGE_KEY = '@TimerKit:recipes';

const exampleRecipe: Recipe = {
  id: `recipe_${Date.now()}`,
  name: '예시) 라면 끓이기',
  memo: '1. 물 550ml를 끓입니다.\n2. 면과 스프를 넣고 4분 더 끓입니다.\n3. 맛있게 드세요!',
  timers: [
    { id: 1, stepName: '물 끓이기', duration: 300 }, // 5분
    { id: 2, stepName: '면 끓이기', duration: 240 }, // 4분
    { id: 3, stepName: '뜸 들이기', duration: 60 },  // 1분
  ],
};

export default function CookingListScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const router = useRouter();
  useFocusEffect(
    React.useCallback(() => {
      const loadRecipes = async () => {
        try {
          const storedRecipes = await getData<Recipe[]>(STORAGE_KEY);
          if (storedRecipes && storedRecipes.length > 0) {
            setRecipes(storedRecipes);
          } else {
            const exampleData = [exampleRecipe];
            setRecipes(exampleData);
            await storeData(STORAGE_KEY, exampleData);
          }
        } catch (e) {
          console.error('Failed to load or set recipes.', e);
        }
      };
      loadRecipes();
    }, [])
  );

  const handleAddNewRecipe = () => {
    const newRecipeId = `recipe_${Date.now()}`;
    router.push({
      pathname: '/CookingScreen/[id]',
      params: { id: newRecipeId },
    });
  };

  const handleDeleteRecipe = (idToDelete: string) => {
    Alert.alert(
      "레시피 삭제",
      "정말로 이 레시피를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive", 
          onPress: async () => {
            const updatedRecipes = recipes.filter(r => r.id !== idToDelete);
            setRecipes(updatedRecipes);
            await storeData(STORAGE_KEY, updatedRecipes);
          } 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Recipes</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.recipeItem} 
            onPress={() => router.push({ pathname: '/CookingScreen/[id]', params: { id: item.id } })}
            onLongPress={() => handleDeleteRecipe(item.id)}
          >
            <Text style={styles.recipeName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>저장된 요리가 없습니다.</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewRecipe}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1e1e', paddingTop: 60 },
    title: { fontSize: 32, fontWeight: 'bold', color: 'white', paddingHorizontal: 20, marginBottom: 20 },
    recipeItem: { backgroundColor: '#333', padding: 20, marginHorizontal: 20, marginBottom: 10, borderRadius: 10 },
    recipeName: { color: 'white', fontSize: 18 },
    emptyText: { color: '#777', textAlign: 'center', marginTop: 50 },
    addButton: { position: 'absolute', right: 30, bottom: 40, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});