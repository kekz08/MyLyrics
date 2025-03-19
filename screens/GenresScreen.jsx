import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { loadGenres, saveGenres } from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext';

export default function GenresScreen({ navigation }) {
  const [genres, setGenres] = useState([]);
  

  const { theme, themeStyles } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const fetchGenres = async () => {
      const loadedGenres = await loadGenres();
      setGenres(loadedGenres);
    };
    fetchGenres();
  }, []);


  const handleAddGenre = useCallback(async (newGenre) => {
    const updatedGenres = [...genres, newGenre];
    setGenres(updatedGenres);
    await saveGenres(updatedGenres);
  }, [genres]);


  const handleEditGenre = useCallback(async (updatedGenre) => {
    const updatedGenres = genres.map((genre) =>
      genre.id === updatedGenre.id ? updatedGenre : genre
    );
    setGenres(updatedGenres);
    await saveGenres(updatedGenres);
  }, [genres]);


  const handleNavigateToAddGenre = () => {
    navigation.navigate('AddGenreScreen', {
      onAddGenre: handleAddGenre,
    });
  };


  const handleNavigateToEditGenre = (genre) => {
    navigation.navigate('AddGenreScreen', {
      onAddGenre: handleEditGenre,
      initialGenre: genre,
    });
  };

  const handleDeleteGenre = async (id) => {
    const updatedGenres = genres.filter((genre) => genre.id !== id);
    setGenres(updatedGenres);
    await saveGenres(updatedGenres);
  };

  const renderItem = useCallback(({ item }) => (
    <View style={[
      styles.genreItem,
      { backgroundColor: isDarkMode ? '#333' : '#fff' }
    ]}>
      <Text style={[
        styles.genreText,
        { color: isDarkMode ? '#fff' : '#333' }
      ]}>
        {item.name}
      </Text>
      <View style={styles.actionButtons}>

        <TouchableOpacity onPress={() => handleNavigateToEditGenre(item)} style={styles.iconButton}>
          <Icon name="edit" size={20} color={isDarkMode ? '#BB86FC' : '#6200ee'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDeleteGenre(item.id)} style={styles.iconButton}>
          <Icon name="delete" size={20} color={isDarkMode ? '#CF6679' : '#B00020'} />
        </TouchableOpacity>
      </View>
    </View>
  ), [genres, isDarkMode]);

  return (
    <View style={[
      styles.container,
      { backgroundColor: themeStyles.backgroundColor }
    ]}>

      <TouchableOpacity onPress={handleNavigateToAddGenre}>
        <Text style={[
          styles.header,
          { color: isDarkMode ? '#BB86FC' : '#6200ee' }
        ]}>
          + Add Genre
        </Text>
      </TouchableOpacity>

      <FlatList
        data={genres}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        extraData={genres}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  genreText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
});
