import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../app/context/ThemeContext';
import { extractLyricsFromHTML } from '../utils/lyricsParser';

// Replace with your actual Genius Client Access Token
const GENIUS_ACCESS_TOKEN = 'ihO4INHFQuweZlmZNbFGOkQdn7cUHZhBR0IskpL1nNouUYlnRr7ij2JyZe9UUr4x';

export default function OnlineLyricsSearch({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { themeStyles } = useTheme();

  const searchLyrics = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      // Using Genius API
      const response = await fetch(
        `https://api.genius.com/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`
          }
        }
      );
      
      const data = await response.json();
      console.log('Genius API response:', data);
      
      if (data.response?.hits) {
        setSearchResults(data.response.hits.map(hit => ({
          id: hit.result.id,
          title: hit.result.title,
          artist: hit.result.primary_artist.name,
          url: hit.result.url
        })));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching lyrics:', error);
      Alert.alert('Error', 'Failed to search lyrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLyrics = async (item) => {
    try {
      // Fetch the actual lyrics content
      const response = await fetch(item.url);
      const html = await response.text();
      
      // Extract lyrics from HTML (this is a simplified example)
      // You'll need to implement proper HTML parsing
      const lyricsContent = extractLyricsFromHTML(html);
      
      // Navigate back to AddLyricsScreen with the lyrics data
      navigation.navigate('AddLyricsScreen', {
        title: item.title,
        artist: item.artist,
        content: lyricsContent
      });
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      Alert.alert('Error', 'Failed to fetch lyrics. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: themeStyles.cardColor }]}
      onPress={() => handleSelectLyrics(item)}
    >
      <View style={styles.resultContent}>
        <Text style={[styles.title, { color: themeStyles.textColor }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.artist, { color: themeStyles.secondaryTextColor }]} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color={themeStyles.secondaryTextColor} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={[styles.searchContainer, { backgroundColor: themeStyles.surfaceColor }]}>
        <TextInput
          style={[styles.searchInput, { color: themeStyles.textColor }]}
          placeholder="Search for lyrics..."
          placeholderTextColor={themeStyles.placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchLyrics}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: themeStyles.primaryColor }]}
          onPress={searchLyrics}
        >
          <Icon name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeStyles.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: themeStyles.secondaryTextColor }]}>
                  No results found
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 