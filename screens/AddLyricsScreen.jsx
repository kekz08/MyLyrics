import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Platform,
  KeyboardAvoidingView,
  Alert
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
    console.log('AddLyricsScreen - handleAdd called with:', {
      title,
      content,
      genreId,
      artist
    });

    if (!genreId) {
      Alert.alert('Error', 'Please select a genre');
      return;
    }

    try {
      const loadedLyrics = await loadLyrics();
      console.log('AddLyricsScreen - Current lyrics in storage:', JSON.stringify(loadedLyrics, null, 2));

      const newLyric = { 
        id: Date.now().toString(), // Convert to string to ensure consistent ID type
        title, 
        content, 
        genreId, 
        artist, 
        date: new Date().toISOString()
      };
      console.log('AddLyricsScreen - New lyric to be added:', JSON.stringify(newLyric, null, 2));

      const updatedLyrics = [...loadedLyrics, newLyric];
      console.log('AddLyricsScreen - Updated lyrics array:', JSON.stringify(updatedLyrics, null, 2));
      
      await saveLyrics(updatedLyrics);
      console.log('AddLyricsScreen - Lyrics saved successfully');
      
      // Verify the save
      const verifyLyrics = await loadLyrics();
      console.log('AddLyricsScreen - Verified lyrics after save:', JSON.stringify(verifyLyrics, null, 2));
      
      navigation.navigate('Home');
    } catch (error) {
      console.error('AddLyricsScreen - Error adding lyrics:', error);
      Alert.alert('Error', 'Failed to add lyrics. Please try again.');
    }
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