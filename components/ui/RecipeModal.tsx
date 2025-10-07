import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RecipeModalProps {
  visible: boolean;
  memo: string;
  onClose: () => void;
  onSave: (newMemo: string) => void;
}

export default function RecipeModal({ visible, memo, onClose, onSave }: RecipeModalProps) {
  const [currentMemo, setCurrentMemo] = useState(memo);

  useEffect(() => {
    setCurrentMemo(memo);
  }, [memo]);

  const handleSave = () => {
    onSave(currentMemo);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>레시피</Text>
            <TouchableOpacity onPress={handleSave}>
              <Ionicons name="checkmark-done" size={28} color="#3498db" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            value={currentMemo}
            onChangeText={setCurrentMemo}
            placeholder="여기에 레시피를 작성하세요..."
            placeholderTextColor="#555"
            autoFocus={true}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    padding: 15,
    color: 'white',
    fontSize: 18,
    textAlignVertical: 'top', // Android에서 위쪽 정렬
  },
});