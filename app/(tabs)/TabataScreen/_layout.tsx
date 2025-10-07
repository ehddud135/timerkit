// app/(tabs)/TabataScreen/_layout.tsx
import { Stack } from 'expo-router';

export default function TabataLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: '',
          headerStyle: { backgroundColor: '#1e1e1e' },
          headerTintColor: 'white',
        }}
      />
    </Stack>
    
  );
}
