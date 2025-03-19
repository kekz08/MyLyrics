import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { loadLyrics, saveLyrics, loadGenres } from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const [lyrics, setLyrics] = useState([]);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const isFocused = useIsFocused();

  const { theme, themeStyles } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const fetchLyricsAndGenres = async () => {
      const loadedLyrics = await loadLyrics();
      setLyrics(loadedLyrics);
      setFilteredLyrics(loadedLyrics);

      const loadedGenres = await loadGenres();
      setGenres(loadedGenres);
    };

    if (isFocused) {
      fetchLyricsAndGenres();
    }
  }, [isFocused]);

  useEffect(() => {
    applyFilters();
  }, [filterText, filterGenre, lyrics]);

  const applyFilters = () => {
    let filtered = lyrics;

    if (filterText) {
      filtered = filtered.filter((lyric) =>
        lyric.artist.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    // ✅ Fix: Reset to full list when "All Genres" is selected
    if (filterGenre) {
      filtered = filtered.filter((lyric) => lyric.genreId === filterGenre);
    }

    setFilteredLyrics(filtered);
  };

  const handleDelete = async (id) => {
    const updatedLyrics = lyrics.filter((lyric) => lyric.id !== id);
    setLyrics(updatedLyrics);
    await saveLyrics(updatedLyrics);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeStyles.backgroundColor,
          padding: 20,
          flex: 1,
        },
        isDarkMode && {
          borderColor: '#333',
        }
      ]}
    >
      {/* Artist Filter */}
      <TextInput
        style={[
          styles.filterInput,
          {
            borderColor: isDarkMode ? '#555' : '#ccc',
            color: isDarkMode ? '#fff' : '#000',
          }
        ]}
        placeholder="Filter by artist..."
        placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
        value={filterText}
        onChangeText={setFilterText}
      />

      {/* Genre Filter */}
      <Picker
        selectedValue={filterGenre}
        style={styles.filterPicker}
        dropdownIconColor="#fff"
        onValueChange={(itemValue) => {
          setFilterGenre(itemValue);
          if (itemValue === '') {
            setFilteredLyrics(lyrics); // ✅ Reset to full list
          }
        }}
      >
        <Picker.Item label="All Genres" value="" />
        {genres.map((genre) => (
          <Picker.Item key={genre.id} label={genre.name} value={genre.id} />
        ))}
      </Picker>

      {/* Lyrics List */}
      <FlatList
        data={filteredLyrics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
              {item.title}
            </Text>
            <Text style={[styles.artist, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Artist: {item.artist}
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* View Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('LyricsDetail', { id: item.id })}
              >
                <Icon name="visibility" size={24} color={isDarkMode ? '#BB86FC' : '#6200ee'} />
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>

              {/* Edit Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('EditLyrics', { id: item.id })}
              >
                <Icon name="edit" size={24} color="#03DAC6" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleDelete(item.id)}
              >
                <Icon name="delete" size={24} color={isDarkMode ? '#CF6679' : '#B00020'} />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  filterInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  filterPicker: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
});