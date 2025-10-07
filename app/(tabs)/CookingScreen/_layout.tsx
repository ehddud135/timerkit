// app/(tabs)/CookingScreen/_layout.tsx
import { Stack } from 'expo-router';

export default function CookingLayout() {
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
