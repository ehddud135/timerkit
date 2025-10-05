// app/(tabs)/CookingScreen/_layout.tsx
import { Stack } from 'expo-router';

export default function CookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
