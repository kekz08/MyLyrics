import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { loadGenres, saveGenres } from '../../utils/storage';

export default function GenresScreen() {
  const [genres, setGenres] = useState([]);
  const [newGenre, setNewGenre] = useState('');

  useEffect(() => {
    const fetchGenres = async () => {
      const loadedGenres = await loadGenres();
      setGenres(loadedGenres);
    };
    fetchGenres();
  }, []);

  const handleAddGenre = async () => {
    if (newGenre.trim() === '') return;
    const updatedGenres = [...genres, newGenre];
    setGenres(updatedGenres);
    await saveGenres(updatedGenres);
    setNewGenre('');
  };

  const handleDeleteGenre = async (index) => {
    const updatedGenres = genres.filter((_, i) => i !== index);
    setGenres(updatedGenres);
    await saveGenres(updatedGenres);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a new genre"
        value={newGenre}
        onChangeText={setNewGenre}
      />
      <Button title="Add Genre" onPress={handleAddGenre} />
      <FlatList
        data={genres}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.genreItem}>
            <Text>{item}</Text>
            <Button title="Delete" onPress={() => handleDeleteGenre(index)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});