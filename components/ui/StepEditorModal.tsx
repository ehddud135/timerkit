import { TimerStep } from '@/hooks/types'; // types.ts 파일 경로 확인
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface StepEditorModalProps {
  visible: boolean;
  step: TimerStep | null; // 수정할 단계 정보
  onClose: () => void;
  onSave: (step: TimerStep) => void;
  onDelete: (stepId: number) => void;
}

export default function StepEditorModal({ visible, step, onClose, onSave, onDelete }: StepEditorModalProps) {
  const [stepName, setStepName] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (step) {
      setStepName(step.stepName);
      setMinutes(Math.floor(step.duration / 60));
      setSeconds(step.duration % 60);
    }
  }, [step]);

  const handleSave = () => {
    if (step) {
      onSave({
        ...step,
        stepName,
        duration: minutes * 60 + seconds,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (step) {
      onDelete(step.id);
    }
    onClose();
  };

  if (!step) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={30} color="#bdc3c7" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.stepNameInput}
            value={stepName}
            onChangeText={setStepName}
          />
          <View style={styles.pickerContainer}>
            {/* 분/초 선택 피커 (이전과 동일) */}
            <Picker selectedValue={minutes} style={styles.picker} itemStyle={styles.pickerItem} onValueChange={setMinutes}>
                {[...Array(60).keys()].map(m => <Picker.Item key={m} label={`${m}분`} value={m} />)}
            </Picker>
            <Picker selectedValue={seconds} style={styles.picker} itemStyle={styles.pickerItem} onValueChange={setSeconds}>
                {[...Array(60).keys()].map(s => <Picker.Item key={s} label={`${s}초`} value={s} />)}
            </Picker>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
              <Text style={styles.buttonText}>삭제</Text>
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
  modalView: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center' },
  stepNameInput: { color: 'dark', fontSize: 22, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#7f8c8d', width: '100%', textAlign: 'center', padding: 5 },
  pickerContainer: { flexDirection: 'row', alignItems: 'center' },
  picker: { flex: 1, color: '#000' },
  pickerItem: { height: 120, color: 'dark' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  button: { borderRadius: 10, padding: 15, flex: 0.45, alignItems: 'center' },
  deleteButton: { backgroundColor: '#e74c3c' },
  saveButton: { backgroundColor: '#3498db' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end' },
});