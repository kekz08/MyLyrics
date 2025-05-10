import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Keyboard,
  Animated,
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../app/context/ThemeContext';
import { loadGenres, saveGenres } from '../utils/storage';

export default function AddGenreScreen({ navigation, route }) {
  const [genre, setGenre] = useState('');
  const { themeStyles } = useTheme();
  const [buttonScale] = useState(new Animated.Value(1));
  const isEditing = route.params?.genreId != null;

  useEffect(() => {
    if (isEditing) {
      setGenre(route.params.initialName || '');
      navigation.setOptions({
        title: 'Edit Genre',
      });
    } else {
      setGenre('');
      navigation.setOptions({
        title: 'Add Genre',
      });
    }
  }, [isEditing, route.params?.initialName]);

  const handleSaveGenre = async () => {
    if (genre.trim() === '') return;

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      const loadedGenres = await loadGenres();
      let updatedGenres;

      if (isEditing) {
        updatedGenres = loadedGenres.map((g) =>
          g.id === route.params.genreId ? { ...g, name: genre } : g
        );
      } else {
        const newGenre = {
          id: Date.now().toString(),
          name: genre,
        };
        updatedGenres = [...loadedGenres, newGenre];
      }

      await saveGenres(updatedGenres);
      setGenre('');
      Keyboard.dismiss();
      navigation.goBack();
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={styles.content}>
        <View style={[styles.inputContainer, { backgroundColor: themeStyles.surfaceColor }]}>
          <Icon name="library-music" size={24} color={themeStyles.primaryColor} />
          <TextInput
            style={[
              styles.input,
              { color: themeStyles.textColor }
            ]}
            placeholder="Enter genre name"
            placeholderTextColor={themeStyles.placeholderColor}
            value={genre}
            onChangeText={setGenre}
            blurOnSubmit={false}
            onSubmitEditing={handleSaveGenre}
            autoFocus
          />
          {genre.length > 0 && (
            <TouchableOpacity onPress={() => setGenre('')}>
              <Icon name="close" size={24} color={themeStyles.secondaryTextColor} />
            </TouchableOpacity>
          )}
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: themeStyles.buttonColor }
            ]}
            onPress={handleSaveGenre}
            disabled={genre.trim() === ''}
          >
            <Icon 
              name={isEditing ? 'check' : 'add'} 
              size={24} 
              color={themeStyles.buttonTextColor} 
            />
            <Text style={[styles.buttonText, { color: themeStyles.buttonTextColor }]}>
              {isEditing ? 'Update Genre' : 'Add Genre'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
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
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
