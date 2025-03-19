import AsyncStorage from '@react-native-async-storage/async-storage';

// Save genres
export const saveGenres = async (genres) => {
  try {
    const jsonValue = JSON.stringify(genres);
    await AsyncStorage.setItem('genres', jsonValue);
  } catch (e) {
    console.error('Failed to save genres:', e);
  }
};

// Load genres
export const loadGenres = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('genres');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load genres:', e);
  }
};

// Save lyrics
export const saveLyrics = async (lyrics) => {
  try {
    const jsonValue = JSON.stringify(lyrics);
    await AsyncStorage.setItem('lyrics', jsonValue);
  } catch (e) {
    console.error('Failed to save lyrics:', e);
  }
};

// Load lyrics
export const loadLyrics = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('lyrics');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load lyrics:', e);
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
