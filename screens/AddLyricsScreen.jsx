import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; // Import useIsFocused
import { loadLyrics, saveLyrics } from '../utils/storage';
import LyricsForm from '../components/LyricsForm';

export default function AddLyricsScreen({ navigation }) {
  const isFocused = useIsFocused(); // Track if the screen is focused
  const [resetForm, setResetForm] = useState(false); // State to trigger form reset

  useEffect(() => {
    if (isFocused) {
      setResetForm(true); // Reset the form when the screen is focused
    }
  }, [isFocused]);

  const handleAdd = async (title, content, genreId, artist) => {
    if (!genreId) {
      alert('Please select a genre');
      return;
    }

    const loadedLyrics = await loadLyrics();
    const newLyric = { id: Date.now(), title, content, genreId, artist, date: new Date() };
    const updatedLyrics = [...loadedLyrics, newLyric];
    await saveLyrics(updatedLyrics);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <LyricsForm
        onSubmit={handleAdd}
        key={resetForm ? 'reset' : 'no-reset'} // Force re-render to reset form
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});