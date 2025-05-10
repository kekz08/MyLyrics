import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Platform,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { loadGenres, saveGenres } from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_COUNT = 2;
const GRID_PADDING = 16;
const ITEM_SPACING = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - (GRID_PADDING * 2) - (ITEM_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

export default function GenresScreen({ navigation }) {
  const [genres, setGenres] = useState([]);
  const { themeStyles } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadGenresList = useCallback(async () => {
    const loadedGenres = await loadGenres();
    setGenres(loadedGenres);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Refresh genres list when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadGenresList();
    }, [loadGenresList])
  );

  const handleNavigateToAddGenre = () => {
    navigation.navigate('AddGenreScreen');
  };

  const handleNavigateToEditGenre = (genre) => {
    navigation.navigate('AddGenreScreen', {
      genreId: genre.id,
      initialName: genre.name,
    });
  };

  const handleDeleteGenre = async (id) => {
    const updatedGenres = genres.filter((genre) => genre.id !== id);
    setGenres(updatedGenres);
    await saveGenres(updatedGenres);
  };

  const renderItem = useCallback(({ item, index }) => {
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
          styles.genreItemContainer,
          {
            transform: [{ scale }],
            opacity: fadeAnim,
            backgroundColor: themeStyles.cardColor,
          },
        ]}
      >
        <View style={styles.genreContent}>
          <View style={styles.genreHeader}>
            <Icon name="library-music" size={24} color={themeStyles.primaryColor} />
            <Text 
              style={[styles.genreText, { color: themeStyles.textColor }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeStyles.surfaceColor }]}
              onPress={() => handleNavigateToEditGenre(item)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <Icon name="edit" size={20} color={themeStyles.accentColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeStyles.surfaceColor }]}
              onPress={() => handleDeleteGenre(item.id)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <Icon name="delete" size={20} color={themeStyles.errorColor} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }, [themeStyles]);

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="queue-music" size={64} color={themeStyles.secondaryTextColor} />
      <Text style={[styles.emptyText, { color: themeStyles.secondaryTextColor }]}>
        No genres added yet
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: themeStyles.buttonColor }]}
        onPress={handleNavigateToAddGenre}
      >
        <Icon name="add" size={24} color={themeStyles.buttonTextColor} />
        <Text style={[styles.addButtonText, { color: themeStyles.buttonTextColor }]}>
          Add New Genre
        </Text>
      </TouchableOpacity>

      <FlatList
        data={genres}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: GRID_PADDING,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  genreItemContainer: {
    width: ITEM_WIDTH,
    margin: ITEM_SPACING / 2,
    borderRadius: 16,
    overflow: 'hidden',
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
  genreContent: {
    padding: 16,
  },
  genreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  genreText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
