import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CookingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. 시간 표시 영역 */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Cooking Screen</Text>
      </View>

      {/* 2. 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.lapButton]}>
          <Text style={styles.buttonText}>랩</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.startButton]}>
          <Text style={styles.buttonText}>시작</Text>
        </TouchableOpacity>
      </View>

      {/* 3. 랩 타임 목록 영역 */}
      <View style={styles.lapContainer}>
        {/* 랩 타임이 여기에 표시될 예정입니다. */}
        <View style={styles.lapItem}>
          <Text style={styles.lapText}>랩 1</Text>
          <Text style={styles.lapText}>00:01.23</Text>
        </View>
        <View style={styles.lapItem}>
          <Text style={styles.lapText}>랩 2</Text>
          <Text style={styles.lapText}>00:02.45</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 전체 화면을 차지하도록 설정
    backgroundColor: '#0D0D0D', // 어두운 배경색
  },
  timerContainer: {
    flex: 3, // 화면의 3/7 비율 차지
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 70,
    fontWeight: '200', // 얇은 폰트
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
    backgroundColor: '#1B361F', // 어두운 녹색
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  lapText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});