import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { loadLyrics, loadGenres } from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext'; 

export default function LyricsDetailScreen({ route }) {
  const { id } = route.params;
  const [lyric, setLyric] = useState(null);
  const [genre, setGenre] = useState('');

  const { theme } = useTheme(); 
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const fetchLyricAndGenre = async () => {
      const loadedLyrics = await loadLyrics();
      const selectedLyric = loadedLyrics.find((lyric) => lyric.id === id);
      setLyric(selectedLyric);

      if (selectedLyric && selectedLyric.genreId) {
        const loadedGenres = await loadGenres();
        const selectedGenre = loadedGenres.find((genre) => genre.id === selectedLyric.genreId);
        setGenre(selectedGenre ? selectedGenre.name : 'Unknown Genre');
      }
    };

    fetchLyricAndGenre();
  }, [id]);

  if (!lyric) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>{lyric.title}</Text>


      <View style={styles.infoContainer}>
        <Icon name="person" size={20} color={isDarkMode ? '#bb86fc' : '#6200ee'} />
        <Text style={[styles.artist, isDarkMode && styles.artistDark]}>
          Artist: {lyric.artist}
        </Text>
      </View>


      <View style={styles.infoContainer}>
        <Icon name="library-music" size={20} color={isDarkMode ? '#03DAC6' : '#03DAC6'} />
        <Text style={[styles.genre, isDarkMode && styles.genreDark]}>
          Genre: {genre}
        </Text>
      </View>


      <Text style={[styles.content, isDarkMode && styles.contentDark]}>
        {lyric.content}
      </Text>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  scrollContainerDark: {
    backgroundColor: '#121212', 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  titleDark: {
    color: '#fff', 
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  artist: {
    fontSize: 18,
    color: '#333',
    marginLeft: 8,
    flexShrink: 1,
  },
  artistDark: {
    color: '#fff', 
  },
  genre: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    flexShrink: 1,
  },
  genreDark: {
    color: '#aaa', 
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginTop: 16,
    textAlign: 'justify',
  },
  contentDark: {
    color: '#ddd', 
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  loadingTextDark: {
    color: '#aaa', 
  },
});
