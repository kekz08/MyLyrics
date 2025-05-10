import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Platform,
  KeyboardAvoidingView 
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { loadLyrics, saveLyrics } from '../utils/storage';
import LyricsForm from '../components/LyricsForm';
import { useTheme } from '../app/context/ThemeContext';

export default function AddLyricsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [resetForm, setResetForm] = useState(false);
  const { themeStyles } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isFocused) {
      setResetForm(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isFocused]);

  const handleAdd = async (title, content, genreId, artist) => {
    if (!genreId) {
      alert('Please select a genre');
      return;
    }

    const loadedLyrics = await loadLyrics();
    const newLyric = { 
      id: Date.now(), 
      title, 
      content, 
      genreId, 
      artist, 
      date: new Date() 
    };
    const updatedLyrics = [...loadedLyrics, newLyric];
    await saveLyrics(updatedLyrics);
    navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <LyricsForm
          onSubmit={handleAdd}
          key={resetForm ? 'reset' : 'no-reset'}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});