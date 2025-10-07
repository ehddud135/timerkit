import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerModalProps {
  visible: boolean;
  initialValue: number;
  onClose: () => void;
  onSave: (value: number) => void;
}

export default function TimePickerModal({ visible, initialValue, onClose, onSave }: TimePickerModalProps) {
  const [minutes, setMinutes] = useState(Math.floor(initialValue / 60));
  const [seconds, setSeconds] = useState(initialValue % 60);

  useEffect(() => {
    // 모달이 열릴 때 초기값으로 상태를 업데이트합니다.
    setMinutes(Math.floor(initialValue / 60));
    setSeconds(initialValue % 60);
  }, [initialValue]);

  const handleSave = () => {
    onSave(minutes * 60 + seconds);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>시간 설정</Text>
          <View style={styles.pickerContainer}>
            {/* 분 선택 피커 */}
            <Picker
              selectedValue={minutes}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue) => setMinutes(itemValue)}
            >
              {[...Array(60).keys()].map(min => (
                <Picker.Item key={min} label={`${min}분`} value={min} />
              ))}
            </Picker>
            {/* 초 선택 피커 */}
            <Picker
              selectedValue={seconds}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue) => setSeconds(itemValue)}
            >
              {[...Array(60).keys()].map(sec => (
                <Picker.Item key={sec} label={`${sec}초`} value={sec} />
              ))}
            </Picker>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  pickerContainer: { flexDirection: 'row', alignItems: 'center' },
  picker: { flex: 1 },
  pickerItem: { height: 120 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  button: { borderRadius: 10, padding: 10, elevation: 2, flex: 0.48 },
  cancelButton: { backgroundColor: '#e74c3c' },
  saveButton: { backgroundColor: '#2196F3' },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});