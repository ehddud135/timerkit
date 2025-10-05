import AsyncStorage from '@react-native-async-storage/async-storage';

// 저장소에서 데이터를 불러오는 범용 함수
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) as T : null;
  } catch (e) {
    console.error(`Failed to load data for key: ${key}`, e);
    return null;
  }
};

// 저장소에 데이터를 저장하는 범용 함수
export const storeData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Failed to save data for key: ${key}`, e);
  }
};