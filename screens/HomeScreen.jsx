import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Platform,
  RefreshControl,
  Modal,
  Pressable
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { 
  loadLyrics, 
  saveLyrics, 
  loadGenres, 
  loadFavorites, 
  saveFavorites,
  loadSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  loadPlaylists,
  savePlaylists
} from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const [lyrics, setLyrics] = useState([]);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    title: '',
    artist: '',
    content: ''
  });
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedLyricId, setSelectedLyricId] = useState(null);
  const [availablePlaylists, setAvailablePlaylists] = useState([]);
  
  const isFocused = useIsFocused();
  const { themeStyles } = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Load data
  const loadData = useCallback(async () => {
    console.log('HomeScreen - Starting to load data...');
    try {
      const [loadedLyrics, loadedGenres, loadedFavorites, loadedHistory] = await Promise.all([
        loadLyrics(),
        loadGenres(),
        loadFavorites(),
        loadSearchHistory()
      ]);
      
      console.log('HomeScreen - Loaded lyrics:', JSON.stringify(loadedLyrics, null, 2));
      
      setLyrics(loadedLyrics);
      setFilteredLyrics(loadedLyrics);
      setGenres(loadedGenres);
      setFavorites(loadedFavorites);
      setSearchHistory(loadedHistory);

      // Animate items in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true
        })
      ]).start();
    } catch (error) {
      console.error('HomeScreen - Error loading data:', error);
      Alert.alert('Error', 'Failed to load lyrics. Please try again.');
    }
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Toggle favorite
  const toggleFavorite = async (lyricId) => {
    const newFavorites = favorites.includes(lyricId)
      ? favorites.filter(id => id !== lyricId)
      : [...favorites, lyricId];
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
  };

  // Advanced search
  const handleAdvancedSearch = () => {
    let filtered = lyrics;
    const { title, artist, content } = advancedFilters;

    if (title) {
      filtered = filtered.filter(lyric => 
        lyric.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    if (artist) {
      filtered = filtered.filter(lyric => 
        lyric.artist.toLowerCase().includes(artist.toLowerCase())
      );
    }
    if (content) {
      filtered = filtered.filter(lyric => 
        lyric.content.toLowerCase().includes(content.toLowerCase())
      );
    }
    if (selectedGenre) {
      filtered = filtered.filter(lyric => lyric.genreId === selectedGenre);
    }

    setFilteredLyrics(filtered);
    setShowAdvancedSearch(false);
  };

  // Search history
  const handleSearchSelect = async (term) => {
    setSearchQuery(term);
    await addToSearchHistory(term);
    setShowSearchHistory(false);
    
    const filtered = lyrics.filter(lyric =>
      lyric.title.toLowerCase().includes(term.toLowerCase()) ||
      lyric.artist.toLowerCase().includes(term.toLowerCase()) ||
      lyric.content.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredLyrics(filtered);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Lyrics',
      'Are you sure you want to delete these lyrics?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedLyrics = lyrics.filter(lyric => lyric.id !== id);
            await saveLyrics(updatedLyrics);
            setLyrics(updatedLyrics);
            setFilteredLyrics(updatedLyrics);
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLyrics(lyrics);
      return;
    }
    
    const filtered = lyrics.filter(lyric =>
      lyric.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lyric.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lyric.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLyrics(filtered);
  }, [searchQuery, lyrics]);

  // Load playlists when needed
  const loadAvailablePlaylists = useCallback(async () => {
    try {
      const playlists = await loadPlaylists();
      setAvailablePlaylists(playlists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  }, []);

  // Handle adding song to playlist
  const handleAddToPlaylist = async (playlistId) => {
    try {
      if (!selectedLyricId || !playlistId) return;

      const playlists = await loadPlaylists();
      const updatedPlaylists = playlists.map(playlist => {
        if (playlist.id === playlistId) {
          // Check if song is already in playlist
          if (playlist.lyricsIds.includes(selectedLyricId)) {
            throw new Error('Song already in playlist');
          }
          return {
            ...playlist,
            lyricsIds: [...playlist.lyricsIds, selectedLyricId],
            updatedAt: new Date().toISOString()
          };
        }
        return playlist;
      });

      await savePlaylists(updatedPlaylists);
      setShowPlaylistModal(false);
      setSelectedLyricId(null);
      Alert.alert('Success', 'Song added to playlist successfully!');
    } catch (error) {
      if (error.message === 'Song already in playlist') {
        Alert.alert('Error', 'This song is already in the selected playlist');
      } else {
        Alert.alert('Error', 'Failed to add song to playlist');
      }
    }
  };

  // Render lyric item
  const renderItem = ({ item, index }) => {
    console.log('Rendering lyric item:', JSON.stringify(item, null, 2));
    const isFavorite = favorites.includes(item.id);
    const genre = genres.find(g => g.id === item.genreId);

    return (
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: themeStyles.cardColor,
            borderColor: themeStyles.borderColor,
            borderWidth: 1,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            console.log('Navigating to LyricsDetail with id:', item.id);
            navigation.navigate('LyricsDetail', { id: item.id });
          }}
          style={styles.cardContent}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: themeStyles.textColor }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.artist, { color: themeStyles.secondaryTextColor }]} numberOfLines={1}>
                {item.artist}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedLyricId(item.id);
                  loadAvailablePlaylists();
                  setShowPlaylistModal(true);
                }}
                style={[styles.actionButton, { backgroundColor: themeStyles.primaryColor }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="playlist-add" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                <Icon
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={24}
                  color={isFavorite ? themeStyles.errorColor : themeStyles.secondaryTextColor}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={[styles.genreTag, { backgroundColor: themeStyles.headerColor }]}>
              <Text style={[styles.genreText, { color: themeStyles.headerTextColor }]}>
                {genre?.name || 'Unknown Genre'}
              </Text>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: themeStyles.surfaceColor }]}
                onPress={() => navigation.navigate('EditLyrics', { id: item.id })}
              >
                <Icon name="edit" size={20} color={themeStyles.primaryColor} />
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
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Add empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="queue-music" size={80} color={themeStyles.secondaryTextColor} />
      <Text style={[styles.emptyText, { color: themeStyles.secondaryTextColor }]}>
        No lyrics found. Add your first lyrics!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: themeStyles.surfaceColor }]}>
          <Icon name="search" size={24} color={themeStyles.secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: themeStyles.textColor }]}
            placeholder="Search lyrics..."
            placeholderTextColor={themeStyles.placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSearchHistory(true)}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={24} color={themeStyles.secondaryTextColor} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowAdvancedSearch(true)}>
            <Icon name="tune" size={24} color={themeStyles.primaryColor} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredLyrics}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          filteredLyrics.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeStyles.primaryColor}
          />
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeStyles.primaryColor }]}
        onPress={() => navigation.navigate('AddLyrics')}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Search History Modal */}
      <Modal
        visible={showSearchHistory && searchHistory.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchHistory(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowSearchHistory(false)}
        >
          <View style={[styles.historyModal, { backgroundColor: themeStyles.surfaceColor }]}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: themeStyles.textColor }]}>
                Recent Searches
              </Text>
              <TouchableOpacity onPress={async () => {
                await clearSearchHistory();
                setSearchHistory([]);
                setShowSearchHistory(false);
              }}>
                <Text style={[styles.clearHistory, { color: themeStyles.primaryColor }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            {searchHistory.map((term, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => handleSearchSelect(term)}
              >
                <Icon name="history" size={20} color={themeStyles.secondaryTextColor} />
                <Text style={[styles.historyText, { color: themeStyles.textColor }]}>
                  {term}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Advanced Search Modal */}
      <Modal
        visible={showAdvancedSearch}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAdvancedSearch(false)}
      >
        <View style={[styles.advancedSearchModal, { backgroundColor: themeStyles.surfaceColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeStyles.textColor }]}>
              Advanced Search
            </Text>
            <TouchableOpacity onPress={() => setShowAdvancedSearch(false)}>
              <Icon name="close" size={24} color={themeStyles.secondaryTextColor} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.advancedInput, { 
              backgroundColor: themeStyles.inputBackground,
              color: themeStyles.textColor,
              borderColor: themeStyles.borderColor
            }]}
            placeholder="Title"
            placeholderTextColor={themeStyles.placeholderColor}
            value={advancedFilters.title}
            onChangeText={text => setAdvancedFilters(prev => ({ ...prev, title: text }))}
          />

          <TextInput
            style={[styles.advancedInput, { 
              backgroundColor: themeStyles.inputBackground,
              color: themeStyles.textColor,
              borderColor: themeStyles.borderColor
            }]}
            placeholder="Artist"
            placeholderTextColor={themeStyles.placeholderColor}
            value={advancedFilters.artist}
            onChangeText={text => setAdvancedFilters(prev => ({ ...prev, artist: text }))}
          />

          <TextInput
            style={[styles.advancedInput, { 
              backgroundColor: themeStyles.inputBackground,
              color: themeStyles.textColor,
              borderColor: themeStyles.borderColor
            }]}
            placeholder="Lyrics content"
            placeholderTextColor={themeStyles.placeholderColor}
            value={advancedFilters.content}
            onChangeText={text => setAdvancedFilters(prev => ({ ...prev, content: text }))}
          />

          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: themeStyles.buttonColor }]}
            onPress={handleAdvancedSearch}
          >
            <Text style={[styles.searchButtonText, { color: themeStyles.buttonTextColor }]}>
              Search
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={showPlaylistModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPlaylistModal(false);
          setSelectedLyricId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeStyles.surfaceColor }]}>
            <Text style={[styles.modalTitle, { color: themeStyles.textColor }]}>
              Add to Playlist
            </Text>

            <FlatList
              data={availablePlaylists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.playlistItem, { borderColor: themeStyles.borderColor }]}
                  onPress={() => handleAddToPlaylist(item.id)}
                >
                  <Text style={[styles.playlistItemText, { color: themeStyles.textColor }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.playlistItemCount, { color: themeStyles.secondaryTextColor }]}>
                    {item.lyricsIds.length} songs
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyPlaylistsContainer}>
                  <Text style={[styles.emptyText, { color: themeStyles.secondaryTextColor }]}>
                    No playlists available
                  </Text>
                  <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: themeStyles.primaryColor }]}
                    onPress={() => {
                      setShowPlaylistModal(false);
                      navigation.navigate('Playlists');
                    }}
                  >
                    <Text style={[styles.createButtonText, { color: '#FFFFFF' }]}>
                      Create Playlist
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: themeStyles.errorColor }]}
              onPress={() => {
                setShowPlaylistModal(false);
                setSelectedLyricId(null);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  historyModal: {
    marginTop: 80,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearHistory: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
  },
  advancedSearchModal: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  advancedInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  searchButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  playlistItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playlistItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  playlistItemCount: {
    fontSize: 14,
  },
  emptyPlaylistsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  createButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});