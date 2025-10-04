import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  // 준비 중인 기능 알림 함수
  const handleComingSoon = () => {
    Alert.alert('알림', '준비 중인 기능입니다.');
  };

  return (
    <View style={styles.container}>
      {/* 화면 상단 상태바 스타일을 어둡게 설정 */}
      <StatusBar barStyle="dark-content" />

      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.title}>TimerKit</Text>
        <Text style={styles.subtitle}>필요한 모든 타이머를 한 곳에서</Text>
      </View>

      {/* 버튼 그리드 영역 */}
      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/stopwatch')}>
          <Ionicons name="stopwatch-outline" size={50} color="#2c3e50" />
          <Text style={styles.buttonText}>스톱워치</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/cooking')}>
          <Ionicons name="fast-food-outline" size={50} color="#e67e22" />
          <Text style={styles.buttonText}>요리 타이머</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/tabata')}>
          <Ionicons name="barbell-outline" size={50} color="#c0392b" />
          <Text style={styles.buttonText}>타바타 타이머</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.disabledButton]} onPress={handleComingSoon}>
          <Ionicons name="walk-outline" size={50} color="#7f8c8d" />
          <Text style={styles.buttonText}>러닝 타이머</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- 스타일 정의 ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', // 밝은 회색 배경
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 80, // 상단 여백
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50', // 어두운 남색
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d', // 회색
    marginTop: 10,
  },
  gridContainer: {
    flexDirection: 'row', // 가로 배치
    flexWrap: 'wrap', // 줄 바꿈 허용
    justifyContent: 'space-between', // 양쪽 끝으로 정렬
  },
  button: {
    width: '48%', // 화면의 48% 너비 (사이에 4% 간격)
    aspectRatio: 1, // 가로세로 비율 1:1 (정사각형)
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '4%',
    // 그림자 (iOS)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // 그림자 (Android)
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0', // 비활성화된 느낌의 회색
  },
  buttonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
  },
});