import AsyncStorage from '@react-native-async-storage/async-storage';

// Save genres
export const saveGenres = async (genres) => {
  try {
    console.log('Saving genres:', genres);
    const jsonValue = JSON.stringify(genres);
    await AsyncStorage.setItem('genres', jsonValue);
    console.log('Genres saved successfully');
  } catch (e) {
    console.error('Failed to save genres:', e);
  }
};

// Load genres
export const loadGenres = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('genres');
    console.log('Loading genres from storage:', jsonValue);
    let parsedGenres = jsonValue != null ? JSON.parse(jsonValue) : [];
    
    // Add default genres if none exist
    if (parsedGenres.length === 0) {
      parsedGenres = [
        { id: 1, name: 'Pop' },
        { id: 2, name: 'Rock' },
        { id: 3, name: 'Hip Hop' },
        { id: 4, name: 'R&B' },
        { id: 5, name: 'Country' },
        { id: 6, name: 'Jazz' },
        { id: 7, name: 'Classical' },
        { id: 8, name: 'Folk' },
        { id: 9, name: 'Electronic' },
        { id: 10, name: 'Other' }
      ];
      await saveGenres(parsedGenres);
    }
    
    console.log('Parsed genres:', parsedGenres);
    return parsedGenres;
  } catch (e) {
    console.error('Failed to load genres:', e);
    return [];
  }
};

// Save lyrics
export const saveLyrics = async (lyrics) => {
  try {
    console.log('Storage - Saving lyrics:', JSON.stringify(lyrics, null, 2));
    const jsonValue = JSON.stringify(lyrics);
    await AsyncStorage.setItem('lyrics', jsonValue);
    console.log('Storage - Lyrics saved successfully');
    
    // Verify the save by reading back
    const savedValue = await AsyncStorage.getItem('lyrics');
    const parsedSavedValue = JSON.parse(savedValue);
    console.log('Storage - Verified saved lyrics:', JSON.stringify(parsedSavedValue, null, 2));
  } catch (e) {
    console.error('Failed to save lyrics:', e);
  }
};

// Load lyrics
export const loadLyrics = async () => {
  try {
    console.log('Storage - Starting to load lyrics...');
    const jsonValue = await AsyncStorage.getItem('lyrics');
    console.log('Storage - Raw lyrics from storage:', jsonValue);
    const parsedLyrics = jsonValue != null ? JSON.parse(jsonValue) : [];
    console.log('Storage - Parsed lyrics:', JSON.stringify(parsedLyrics, null, 2));
    console.log('Storage - Number of lyrics loaded:', parsedLyrics.length);
    return parsedLyrics;
  } catch (e) {
    console.error('Failed to load lyrics:', e);
    return [];
  }
};

// Save theme
export const saveTheme = async (theme) => {
  try {
    await AsyncStorage.setItem('theme', theme);
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
};

// Load theme
export const loadTheme = async () => {
  try {
    const theme = await AsyncStorage.getItem('theme');
    return theme || 'light'; // Default to light mode
  } catch (e) {
    console.error('Failed to load theme:', e);
    return 'light';
  }
};

// Save favorites
export const saveFavorites = async (favorites) => {
  try {
    const jsonValue = JSON.stringify(favorites);
    await AsyncStorage.setItem('favorites', jsonValue);
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
};

// Load favorites
export const loadFavorites = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('favorites');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load favorites:', e);
    return [];
  }
};

// Save search history
export const saveSearchHistory = async (searchHistory) => {
  try {
    const jsonValue = JSON.stringify(searchHistory);
    await AsyncStorage.setItem('searchHistory', jsonValue);
  } catch (e) {
    console.error('Failed to save search history:', e);
  }
};

// Load search history
export const loadSearchHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('searchHistory');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load search history:', e);
    return [];
  }
};

// Add to search history
export const addToSearchHistory = async (searchTerm) => {
  try {
    const history = await loadSearchHistory();
    const updatedHistory = [searchTerm, ...history.filter(term => term !== searchTerm)].slice(0, 10);
    await saveSearchHistory(updatedHistory);
    return updatedHistory;
  } catch (e) {
    console.error('Failed to add to search history:', e);
    return [];
  }
};

// Clear search history
export const clearSearchHistory = async () => {
  try {
    await AsyncStorage.setItem('searchHistory', JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear search history:', e);
  }
};

// Save playlists
export const savePlaylists = async (playlists) => {
  try {
    console.log('Storage - Saving playlists:', JSON.stringify(playlists, null, 2));
    const jsonValue = JSON.stringify(playlists);
    await AsyncStorage.setItem('playlists', jsonValue);
    console.log('Storage - Playlists saved successfully');
    
    // Verify the save
    const savedValue = await AsyncStorage.getItem('playlists');
    const parsedSavedValue = JSON.parse(savedValue);
    console.log('Storage - Verified saved playlists:', JSON.stringify(parsedSavedValue, null, 2));
    return true;
  } catch (e) {
    console.error('Storage - Failed to save playlists:', e);
    throw new Error('Failed to save playlists');
  }
};

// Load playlists
export const loadPlaylists = async () => {
  try {
    console.log('Storage - Starting to load playlists...');
    const jsonValue = await AsyncStorage.getItem('playlists');
    console.log('Storage - Raw playlists from storage:', jsonValue);
    
    let parsedPlaylists = jsonValue ? JSON.parse(jsonValue) : [];
    
    // Add a sample playlist if none exist
    if (parsedPlaylists.length === 0) {
      console.log('Storage - No playlists found, creating sample playlist');
      const samplePlaylist = {
        id: 'sample-' + Date.now().toString(),
        name: 'My First Playlist',
        lyricsIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      parsedPlaylists = [samplePlaylist];
      await savePlaylists(parsedPlaylists);
    }

    console.log('Storage - Parsed playlists:', JSON.stringify(parsedPlaylists, null, 2));
    console.log('Storage - Number of playlists loaded:', parsedPlaylists.length);
    
    // Validate playlist structure
    const validatedPlaylists = parsedPlaylists.map(playlist => ({
      id: playlist.id?.toString() || Date.now().toString(),
      name: playlist.name || 'Untitled Playlist',
      lyricsIds: Array.isArray(playlist.lyricsIds) ? playlist.lyricsIds : [],
      createdAt: playlist.createdAt || new Date().toISOString(),
      updatedAt: playlist.updatedAt || new Date().toISOString()
    }));

    return validatedPlaylists;
  } catch (e) {
    console.error('Storage - Failed to load playlists:', e);
    return [];
  }
};

// Save lyrics formatting preferences
export const saveLyricsPreferences = async (preferences) => {
  try {
    const jsonValue = JSON.stringify(preferences);
    await AsyncStorage.setItem('lyricsPreferences', jsonValue);
  } catch (e) {
    console.error('Failed to save lyrics preferences:', e);
  }
};

// Load lyrics formatting preferences
export const loadLyricsPreferences = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('lyricsPreferences');
    return jsonValue != null ? JSON.parse(jsonValue) : {
      fontSize: 16,
      lineHeight: 1.5,
      showChords: true,
      fontFamily: 'System',
      alignment: 'left'
    };
  } catch (e) {
    console.error('Failed to load lyrics preferences:', e);
    return {
      fontSize: 16,
      lineHeight: 1.5,
      showChords: true,
      fontFamily: 'System',
      alignment: 'left'
    };
  }
};

// Save tags
export const saveTags = async (tags) => {
  try {
    const jsonValue = JSON.stringify(tags);
    await AsyncStorage.setItem('tags', jsonValue);
  } catch (e) {
    console.error('Failed to save tags:', e);
  }
};

// Load tags
export const loadTags = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('tags');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load tags:', e);
    return [];
  }
};

// Save lyrics tags
export const saveLyricsTags = async (lyricsTags) => {
  try {
    const jsonValue = JSON.stringify(lyricsTags);
    await AsyncStorage.setItem('lyricsTags', jsonValue);
  } catch (e) {
    console.error('Failed to save lyrics tags:', e);
  }
};

// Load lyrics tags
export const loadLyricsTags = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('lyricsTags');
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Failed to load lyrics tags:', e);
    return {};
  }
};

// Clear all storage (for testing)
export const clearAllStorage = async () => {
  try {
    console.log('Storage - Clearing all data...');
    await AsyncStorage.clear();
    console.log('Storage - All data cleared successfully');
    return true;
  } catch (e) {
    console.error('Storage - Failed to clear storage:', e);
    return false;
  }
};
