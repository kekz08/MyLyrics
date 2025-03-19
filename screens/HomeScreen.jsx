import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { loadLyrics, saveLyrics, loadGenres } from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const [lyrics, setLyrics] = useState([]);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [filterArtist, setFilterArtist] = useState(''); 
  const [selectedGenre, setSelectedGenre] = useState(''); 
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
  }, [filterArtist, selectedGenre, lyrics]);

  const applyFilters = () => {
    let filtered = lyrics;


    if (filterArtist) {
      filtered = filtered.filter((lyric) =>
        lyric.artist.toLowerCase().includes(filterArtist.toLowerCase())
      );
    }


    if (selectedGenre) {
      filtered = filtered.filter((lyric) => lyric.genreId === selectedGenre);
    }

    setFilteredLyrics(filtered);
  };

  const handleDelete = async (id) => {
    const updatedLyrics = lyrics.filter((lyric) => lyric.id !== id);
    setLyrics(updatedLyrics);
    await saveLyrics(updatedLyrics);
  };


  const getGenreName = (genreId) => {
    const genre = genres.find((g) => g.id === genreId);
    return genre ? genre.name : 'Unknown Genre';
  };

  const renderEmptyMessage = () => {
    if (selectedGenre && filteredLyrics.length === 0) {
      const genreName = getGenreName(selectedGenre);
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDarkMode && { color: '#fff' }]}>
            No lyrics found in {genreName} genre!
          </Text>
        </View>
      );
    }
    return null;
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
        },
      ]}
    >

      <TextInput
        style={[
          styles.filterInput,
          { borderColor: isDarkMode ? '#555' : '#ccc', color: isDarkMode ? '#fff' : '#000' },
        ]}
        placeholder="Filter by artist..."
        placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
        value={filterArtist}
        onChangeText={setFilterArtist}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.radioContainer}>

        <TouchableOpacity
          style={[
            styles.radioButton,
            selectedGenre === '' && styles.radioButtonSelected,
          ]}
          onPress={() => setSelectedGenre('')}
        >
          <Text style={[styles.radioText, isDarkMode && { color: '#fff' }]}>All Genres</Text>
        </TouchableOpacity>

        {genres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.radioButton,
              selectedGenre === genre.id && styles.radioButtonSelected,
            ]}
            onPress={() => setSelectedGenre(genre.id)}
          >
            <Text style={[styles.radioText, isDarkMode && { color: '#fff' }]}>{genre.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>


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
            <Text style={[styles.genre, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Genre: {getGenreName(item.genreId)}
            </Text>


            <View style={styles.buttonContainer}>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('LyricsDetail', { id: item.id })}
              >
                <Icon name="visibility" size={24} color={isDarkMode ? '#BB86FC' : '#6200ee'} />
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('EditLyrics', { id: item.id })}
              >
                <Icon name="edit" size={24} color="#03DAC6" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

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
        ListEmptyComponent={renderEmptyMessage} 
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
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  radioButton: {
    width: 100, 
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
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
    marginBottom: 4,
  },
  genre: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});