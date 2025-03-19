import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from '../app/context/ThemeContext';

export default function AddGenreScreen({ navigation, route }) {
  const [genre, setGenre] = useState('');
  const { themeStyles } = useTheme();

  useEffect(() => {
    if (route.params?.initialGenre) {
      setGenre(route.params.initialGenre.name || '');
      navigation.setOptions({
        title: 'Edit Genre',
      });
    } else {
      setGenre('');
      navigation.setOptions({
        title: 'Add Genre',
      });
    }
  }, [route.params?.initialGenre]);

  const handleSaveGenre = () => {
    if (genre.trim() === '') return;

    if (route.params?.initialGenre) {
      route.params.onAddGenre({
        id: route.params.initialGenre.id,
        name: genre,
      });
    } else {
      route.params.onAddGenre({
        id: Date.now(),
        name: genre,
      });
    }

    setGenre('');
    Keyboard.dismiss();
    navigation.navigate('GenresScreen');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeStyles.backgroundColor,
            color: themeStyles.textColor,
            borderColor: themeStyles.textColor,
          },
        ]}
        placeholder="Enter genre name"
        placeholderTextColor={themeStyles.textColor + '88'}
        value={genre}
        onChangeText={setGenre}
        blurOnSubmit={false}
        onSubmitEditing={handleSaveGenre}
      />
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: themeStyles.headerColor }]}
        onPress={handleSaveGenre}
      >
        <Text style={[styles.buttonText, { color: themeStyles.headerTextColor }]}>
          {route.params?.initialGenre ? 'Update Genre' : 'Add Genre'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  addButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
