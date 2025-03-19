import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function LyricsDetail() {
  const { id } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text>Lyrics Detail for ID: {id}</Text>
    </View>
  );
}