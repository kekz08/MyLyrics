import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Animated,
  Platform,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../app/context/ThemeContext';
import { loadPlaylists, savePlaylists, loadLyrics } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function PlaylistsScreen({ navigation }) {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [lyrics, setLyrics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { themeStyles } = useTheme();
  
  // Create a ref to store animation values for each item
  const animationValues = useRef({});

  // Load data
  const loadData = useCallback(async () => {
    try {
      console.log('PlaylistsScreen - Loading data...');
      setRefreshing(true);
      
      const [loadedPlaylists, loadedLyrics] = await Promise.all([
        loadPlaylists(),
        loadLyrics()
      ]);
      console.log('PlaylistsScreen - Loaded playlists:', JSON.stringify(loadedPlaylists, null, 2));
      console.log('PlaylistsScreen - Number of playlists:', loadedPlaylists.length);
      
      // Reset animation values for new items
      loadedPlaylists.forEach((playlist) => {
        if (!animationValues.current[playlist.id]) {
          animationValues.current[playlist.id] = new Animated.Value(0);
        }
      });

      setPlaylists(loadedPlaylists);
      setLyrics(loadedLyrics);

      // Animate all items with stagger
      const animations = loadedPlaylists.map((playlist, index) => {
        return Animated.spring(animationValues.current[playlist.id], {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
          delay: index * 100
        });
      });

      Animated.parallel(animations).start();
    } catch (error) {
      console.error('PlaylistsScreen - Error loading data:', error);
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('PlaylistsScreen - Screen focused, loading data...');
      loadData();
    }, [loadData])
  );

  // Refresh control
  const onRefresh = useCallback(async () => {
    console.log('PlaylistsScreen - Manual refresh triggered');
    await loadData();
  }, [loadData]);

  const handleCreatePlaylist = async () => {
    try {
      console.log('PlaylistsScreen - Creating new playlist with name:', newPlaylistName);
      
      if (!newPlaylistName.trim()) {
        Alert.alert('Error', 'Please enter a playlist name');
        return;
      }

      const newPlaylist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        lyricsIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('PlaylistsScreen - New playlist object:', JSON.stringify(newPlaylist, null, 2));

      // Initialize animation value for the new playlist
      animationValues.current[newPlaylist.id] = new Animated.Value(0);

      const updatedPlaylists = [...playlists, newPlaylist];
      await savePlaylists(updatedPlaylists);
      
      // Verify the save
      const verifyPlaylists = await loadPlaylists();
      console.log('PlaylistsScreen - Verified playlists after save:', JSON.stringify(verifyPlaylists, null, 2));
      
      setPlaylists(verifyPlaylists); // Use the verified playlists
      setNewPlaylistName('');
      setShowCreateModal(false);

      // Animate the new playlist
      Animated.spring(animationValues.current[newPlaylist.id], {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }).start();

      // Show success message
      Alert.alert('Success', 'Playlist created successfully!');
    } catch (error) {
      console.error('PlaylistsScreen - Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist. Please try again.');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure you want to delete this playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
            await savePlaylists(updatedPlaylists);
            setPlaylists(updatedPlaylists);
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    console.log('PlaylistsScreen - Rendering playlist item:', item.name);
    const lyricsCount = item.lyricsIds.length;
    const playlistLyrics = lyrics.filter(l => item.lyricsIds.includes(l.id));
    const animationValue = animationValues.current[item.id];

    return (
      <Animated.View
        style={[
          styles.playlistCard,
          {
            backgroundColor: themeStyles.cardColor,
            borderColor: themeStyles.borderColor,
            borderWidth: 1,
            transform: [
              { scale: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              })},
              { translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })}
            ],
            opacity: animationValue
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id })}
          style={styles.playlistContent}
          activeOpacity={0.7}
        >
          <View style={styles.playlistInfo}>
            <Text style={[styles.playlistName, { color: themeStyles.textColor }]}>
              {item.name}
            </Text>
            <Text style={[styles.playlistMeta, { color: themeStyles.secondaryTextColor }]}>
              {lyricsCount} {lyricsCount === 1 ? 'song' : 'songs'}
            </Text>
            
            <View style={styles.previewContainer}>
              {playlistLyrics.slice(0, 3).map((lyric, idx) => (
                <Text
                  key={lyric.id}
                  style={[styles.previewText, { color: themeStyles.secondaryTextColor }]}
                  numberOfLines={1}
                >
                  • {lyric.title} - {lyric.artist}
                </Text>
              ))}
              {lyricsCount === 0 && (
                <Text style={[styles.emptyPlaylistText, { color: themeStyles.secondaryTextColor }]}>
                  No songs added yet
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => handleDeletePlaylist(item.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="delete-outline" size={24} color={themeStyles.errorColor} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Add empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="queue-music" size={80} color={themeStyles.secondaryTextColor} />
      <Text style={[styles.emptyText, { color: themeStyles.secondaryTextColor }]}>
        No playlists yet. Create your first playlist!
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: themeStyles.primaryColor }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={[styles.createButtonText, { color: themeStyles.buttonTextColor }]}>
          Create Playlist
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <FlatList
        data={playlists}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          playlists.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeStyles.primaryColor]}
            tintColor={themeStyles.primaryColor}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: themeStyles.textColor }]}>
              {playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeStyles.primaryColor }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeStyles.surfaceColor }]}>
            <Text style={[styles.modalTitle, { color: themeStyles.textColor }]}>
              Create New Playlist
            </Text>
            
            <TextInput
              style={[styles.input, {
                backgroundColor: themeStyles.inputBackground,
                color: themeStyles.textColor,
                borderColor: themeStyles.borderColor
              }]}
              placeholder="Playlist name"
              placeholderTextColor={themeStyles.placeholderColor}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: themeStyles.errorColor }]}
                onPress={() => {
                  setNewPlaylistName('');
                  setShowCreateModal(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: themeStyles.primaryColor }]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
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
  list: {
    padding: 16,
  },
  header: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
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
  playlistCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  playlistContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  playlistInfo: {
    flex: 1,
    marginRight: 16,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 14,
    marginBottom: 8,
  },
  previewContainer: {
    marginTop: 8,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyPlaylistText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
}); 