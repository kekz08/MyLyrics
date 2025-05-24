import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { loadGenres } from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext';

export default function LyricsForm({ onSubmit, prefill = {}, ...props }) {
  const [title, setTitle] = useState(prefill.title || '');
  const [artist, setArtist] = useState(prefill.artist || '');
  const [content, setContent] = useState(prefill.content || '');
  const [genreId, setGenreId] = useState(prefill.genreId || null);
  const [genres, setGenres] = useState([]);

  const { theme } = useTheme(); 
  const isDarkMode = theme === 'dark';

  useFocusEffect(
    useCallback(() => {
      const fetchGenres = async () => {
        const loadedGenres = await loadGenres();
        setGenres(loadedGenres);
      };
      fetchGenres();
    }, [])
  );

  const handleSave = () => {
    console.log('Attempting to save lyrics with:', {
      title,
      artist,
      content,
      genreId
    });

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!artist.trim()) {
      Alert.alert('Error', 'Please enter an artist');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter the lyrics content');
      return;
    }
    if (!genreId) {
      Alert.alert('Error', 'Please select a genre');
      return;
    }

    console.log('All validation passed, submitting lyrics');
    onSubmit(title.trim(), content.trim(), genreId, artist.trim());

    // Clear form
    setTitle('');
    setContent('');
    setGenreId(null);
    setArtist('');
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.header, isDarkMode && styles.headerDark]}>Lyrics Form</Text>

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Title"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Artist"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={artist}
        onChangeText={setArtist}
      />

      <TextInput
        style={[
          styles.input,
          styles.multilineInput,
          isDarkMode && styles.inputDark,
        ]}
        placeholder="Content"
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        value={content}
        onChangeText={setContent}
        multiline
      />

      <View style={[styles.pickerContainer, isDarkMode && styles.pickerContainerDark]}>
        <Picker
          selectedValue={genreId}
          onValueChange={(itemValue) => setGenreId(itemValue)}
          style={isDarkMode ? styles.pickerDark : styles.picker}
          dropdownIconColor={isDarkMode ? '#fff' : '#000'}
        >
          <Picker.Item label="Select a genre" value={null} />
          {genres.map((genre) => (
            <Picker.Item key={genre.id} label={genre.name} value={genre.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity 
        style={[styles.button, isDarkMode && styles.buttonDark]} 
        onPress={handleSave}
      >
        <Text style={[styles.buttonText, isDarkMode && styles.buttonTextDark]}>
          Save Lyrics
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 16,
  },
  headerDark: {
    color: '#bb86fc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
  },
  inputDark: {
    borderColor: '#444',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  multilineInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  pickerContainerDark: {
    borderColor: '#444',
    backgroundColor: '#1e1e1e',
  },
  picker: {
    color: '#000',
  },
  pickerDark: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#bb86fc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDark: {
    color: '#121212',
  },
});