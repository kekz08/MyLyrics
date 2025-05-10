import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  Animated,
  Platform
} from 'react-native';
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
  const { themeStyles } = useTheme();

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
    Alert.alert(
      "Delete Lyrics",
      "Are you sure you want to delete these lyrics?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedLyrics = lyrics.filter((lyric) => lyric.id !== id);
            setLyrics(updatedLyrics);
            await saveLyrics(updatedLyrics);
          }
        }
      ]
    );
  };

  const getGenreName = (genreId) => {
    const genre = genres.find((g) => g.id === genreId);
    return genre ? genre.name : 'Unknown Genre';
  };

  const renderEmptyMessage = () => {
    if (filteredLyrics.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="music-off" size={64} color={themeStyles.secondaryTextColor} />
          <Text style={[styles.emptyText, { color: themeStyles.secondaryTextColor }]}>
            {selectedGenre 
              ? `No lyrics found in ${getGenreName(selectedGenre)} genre!`
              : 'No lyrics found!'}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderItem = ({ item, index }) => {
    const scale = new Animated.Value(1);
    
    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          { 
            transform: [{ scale }],
            backgroundColor: themeStyles.cardColor,
            marginLeft: 20,
            marginRight: 20,
            marginBottom: index === filteredLyrics.length - 1 ? 20 : 10
          }
        ]}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: themeStyles.textColor }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.artist, { color: themeStyles.secondaryTextColor }]} numberOfLines={1}>
            {item.artist}
          </Text>
          <View style={styles.genreContainer}>
            <Icon name="library-music" size={16} color={themeStyles.primaryColor} />
            <Text style={[styles.genre, { color: themeStyles.secondaryTextColor }]}>
              {getGenreName(item.genreId)}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeStyles.surfaceColor }]}
              onPress={() => navigation.navigate('LyricsDetail', { id: item.id })}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <Icon name="visibility" size={20} color={themeStyles.primaryColor} />
              <Text style={[styles.buttonText, { color: themeStyles.textColor }]}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeStyles.surfaceColor }]}
              onPress={() => navigation.navigate('EditLyrics', { id: item.id })}
            >
              <Icon name="edit" size={20} color={themeStyles.accentColor} />
              <Text style={[styles.buttonText, { color: themeStyles.textColor }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeStyles.surfaceColor }]}
              onPress={() => handleDelete(item.id)}
            >
              <Icon name="delete" size={20} color={themeStyles.errorColor} />
              <Text style={[styles.buttonText, { color: themeStyles.textColor }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: themeStyles.surfaceColor }]}>
          <Icon name="search" size={24} color={themeStyles.secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: themeStyles.textColor }]}
            placeholder="Search by artist..."
            placeholderTextColor={themeStyles.placeholderColor}
            value={filterArtist}
            onChangeText={setFilterArtist}
          />
          {filterArtist !== '' && (
            <TouchableOpacity onPress={() => setFilterArtist('')}>
              <Icon name="close" size={24} color={themeStyles.secondaryTextColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.genreScroll}
        contentContainerStyle={styles.genreScrollContent}
      >
        <TouchableOpacity
          style={[
            styles.genreChip,
            { 
              backgroundColor: selectedGenre === '' ? themeStyles.primaryColor : themeStyles.surfaceColor,
              borderColor: themeStyles.primaryColor
            }
          ]}
          onPress={() => setSelectedGenre('')}
        >
          <Text
            style={[
              styles.genreChipText,
              { color: selectedGenre === '' ? themeStyles.buttonTextColor : themeStyles.primaryColor }
            ]}
          >
            All Genres
          </Text>
        </TouchableOpacity>

        {genres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.genreChip,
              {
                backgroundColor: selectedGenre === genre.id ? themeStyles.primaryColor : themeStyles.surfaceColor,
                borderColor: themeStyles.primaryColor
              }
            ]}
            onPress={() => setSelectedGenre(genre.id)}
          >
            <Text
              style={[
                styles.genreChipText,
                { color: selectedGenre === genre.id ? themeStyles.buttonTextColor : themeStyles.primaryColor }
              ]}
            >
              {genre.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredLyrics}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmptyMessage}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
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
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  genreScroll: {
    maxHeight: 60,
    paddingVertical: 10,
  },
  genreScrollContent: {
    paddingHorizontal: 15,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
  },
  genreChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 10,
  },
  cardContainer: {
    borderRadius: 16,
    marginVertical: 6,
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
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    marginBottom: 8,
  },
  genreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  genre: {
    fontSize: 14,
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});