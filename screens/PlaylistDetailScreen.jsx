import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../app/context/ThemeContext';
import { loadLyrics, loadPlaylists, savePlaylists } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function PlaylistDetailScreen({ route, navigation }) {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState(null);
  const [allLyrics, setAllLyrics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { themeStyles } = useTheme();
  const animationValues = useRef({});

  const loadData = useCallback(async () => {
    try {
      console.log('PlaylistDetailScreen - Loading data...');
      setRefreshing(true);

      const [loadedPlaylists, loadedLyrics] = await Promise.all([
        loadPlaylists(),
        loadLyrics()
      ]);

      const currentPlaylist = loadedPlaylists.find(p => p.id === playlistId);
      if (!currentPlaylist) {
        Alert.alert('Error', 'Playlist not found');
        navigation.goBack();
        return;
      }

      // Reset animation values for new items
      currentPlaylist.lyricsIds.forEach((id) => {
        if (!animationValues.current[id]) {
          animationValues.current[id] = new Animated.Value(0);
        }
      });

      setPlaylist(currentPlaylist);
      setAllLyrics(loadedLyrics);

      // Animate all items with stagger
      const animations = currentPlaylist.lyricsIds.map((id, index) => {
        return Animated.spring(animationValues.current[id], {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
          delay: index * 100
        });
      });

      Animated.parallel(animations).start();
    } catch (error) {
      console.error('PlaylistDetailScreen - Error loading data:', error);
      Alert.alert('Error', 'Failed to load playlist details');
    } finally {
      setRefreshing(false);
    }
  }, [playlistId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRemoveLyric = async (lyricId) => {
    try {
      const updatedLyricsIds = playlist.lyricsIds.filter(id => id !== lyricId);
      const updatedPlaylist = { ...playlist, lyricsIds: updatedLyricsIds };
      
      const allPlaylists = await loadPlaylists();
      const updatedPlaylists = allPlaylists.map(p => 
        p.id === playlist.id ? updatedPlaylist : p
      );
      
      await savePlaylists(updatedPlaylists);
      setPlaylist(updatedPlaylist);
      
      // Animate out the removed item
      Animated.timing(animationValues.current[lyricId], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    } catch (error) {
      console.error('Error removing lyric from playlist:', error);
      Alert.alert('Error', 'Failed to remove song from playlist');
    }
  };

  const renderItem = ({ item: lyricId, index }) => {
    const lyric = allLyrics.find(l => l.id === lyricId);
    if (!lyric) return null;

    const animationValue = animationValues.current[lyricId];

    return (
      <Animated.View
        style={[
          styles.card,
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
          onPress={() => navigation.navigate('LyricsDetail', { id: lyricId })}
          style={styles.cardContent}
          activeOpacity={0.7}
        >
          <View style={styles.lyricInfo}>
            <Text style={[styles.title, { color: themeStyles.textColor }]}>
              {lyric.title}
            </Text>
            <Text style={[styles.artist, { color: themeStyles.secondaryTextColor }]}>
              {lyric.artist}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => handleRemoveLyric(lyricId)}
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="remove-circle-outline" size={24} color={themeStyles.errorColor} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="queue-music" size={80} color={themeStyles.secondaryTextColor} />
      <Text style={[styles.emptyText, { color: themeStyles.secondaryTextColor }]}>
        No songs in this playlist yet.
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: themeStyles.primaryColor }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={[styles.addButtonText, { color: themeStyles.buttonTextColor }]}>
          Add Songs
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!playlist) return null;

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.playlistName, { color: themeStyles.textColor }]}>
          {playlist.name}
        </Text>
        <Text style={[styles.songCount, { color: themeStyles.secondaryTextColor }]}>
          {playlist.lyricsIds.length} {playlist.lyricsIds.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      <FlatList
        data={playlist.lyricsIds}
        renderItem={renderItem}
        keyExtractor={item => item.toString()}
        contentContainerStyle={[
          styles.list,
          playlist.lyricsIds.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadData}
            colors={[themeStyles.primaryColor]}
            tintColor={themeStyles.primaryColor}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  playlistName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songCount: {
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lyricInfo: {
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
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 