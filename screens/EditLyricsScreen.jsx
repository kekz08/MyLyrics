import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { loadLyrics, saveLyrics, loadGenres } from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext'; 

export default function EditLyricsScreen({ route, navigation }) {
  const { id } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genreId, setGenreId] = useState('');
  const [artist, setArtist] = useState('');
  const [genres, setGenres] = useState([]);

  const { theme } = useTheme(); 
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const fetchLyricAndGenres = async () => {
      const loadedLyrics = await loadLyrics();
      const selectedLyric = loadedLyrics.find((lyric) => lyric.id === id);
      if (selectedLyric) {
        setTitle(selectedLyric.title);
        setContent(selectedLyric.content);
        setGenreId(selectedLyric.genreId);
        setArtist(selectedLyric.artist || '');
      }

      const loadedGenres = await loadGenres();
      setGenres(loadedGenres);
    };

    fetchLyricAndGenres();
  }, [id]);

  const handleSave = async () => {
    const loadedLyrics = await loadLyrics();
    const updatedLyrics = loadedLyrics.map((lyric) =>
      lyric.id === id ? { ...lyric, title, content, genreId, artist } : lyric
    );
    await saveLyrics(updatedLyrics);
    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
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
        style={[styles.input, styles.multilineInput, isDarkMode && styles.inputDark]}
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
          dropdownIconColor={isDarkMode ? '#aaa' : '#000'}
        >
          <Picker.Item label="Select a genre" value={null} />
          {genres.map((genre) => (
            <Picker.Item key={genre.id} label={genre.name} value={genre.id} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity style={[styles.saveButton, isDarkMode && styles.saveButtonDark]} onPress={handleSave}>
        <Text style={[styles.buttonText, isDarkMode && styles.buttonTextDark]}>Save</Text>
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
    borderColor: '#555',
    backgroundColor: '#222',
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
    borderColor: '#555',
    backgroundColor: '#222',
  },
  picker: {
    color: '#000',
  },
  pickerDark: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDark: {
    backgroundColor: '#bb86fc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDark: {
    color: '#000',
  },
});
