import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Animated,
  Platform,
  StatusBar,
  Dimensions,
  Share,
  TouchableOpacity,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { loadLyrics, loadGenres } from '../utils/storage';
import { useTheme } from '../app/context/ThemeContext';

const HEADER_MAX_HEIGHT = 250;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const { width } = Dimensions.get('window');

export default function LyricsDetailScreen({ route }) {
  const { id } = route.params;
  const [lyric, setLyric] = useState(null);
  const [genre, setGenre] = useState('');
  const { themeStyles } = useTheme();
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    const fetchLyricAndGenre = async () => {
      const loadedLyrics = await loadLyrics();
      const selectedLyric = loadedLyrics.find((lyric) => lyric.id === id);
      setLyric(selectedLyric);

      if (selectedLyric && selectedLyric.genreId) {
        const loadedGenres = await loadGenres();
        const selectedGenre = loadedGenres.find((genre) => genre.id === selectedLyric.genreId);
        setGenre(selectedGenre ? selectedGenre.name : 'Unknown Genre');
      }
    };

    fetchLyricAndGenre();
  }, [id]);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        title: lyric.title,
        message: `${lyric.title} by ${lyric.artist}\n\n${lyric.content}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share lyrics');
    }
  };

  if (!lyric) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeStyles.backgroundColor }]}>
        <Icon name="music-note" size={48} color={themeStyles.primaryColor} />
        <Text style={[styles.loadingText, { color: themeStyles.secondaryTextColor }]}>
          Loading...
        </Text>
      </View>
    );
  }

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const headerInfoOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: themeStyles.headerColor,
            transform: [
              { translateY: headerTranslateY },
              { scale: headerScale }
            ]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Icon name="share" size={24} color={themeStyles.headerTextColor} />
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.headerInfo,
            { opacity: headerInfoOpacity }
          ]}
        >
          <Text style={[styles.headerTitle, { color: themeStyles.headerTextColor }]}>
            {lyric.title}
          </Text>
          <Text style={[styles.headerArtist, { color: themeStyles.headerTextColor }]}>
            {lyric.artist}
          </Text>
        </Animated.View>

        <Animated.Text
          style={[
            styles.headerScrollTitle,
            { 
              opacity: headerTitleOpacity,
              color: themeStyles.headerTextColor
            }
          ]}
          numberOfLines={1}
        >
          {lyric.title}
        </Animated.Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={{ height: HEADER_MAX_HEIGHT }} />
        <View style={styles.metadataContainer}>
          <View style={[styles.metadataCard, { backgroundColor: themeStyles.cardColor }]}>
            <View style={styles.metadataItem}>
              <Icon name="person" size={24} color={themeStyles.primaryColor} />
              <View style={styles.metadataText}>
                <Text style={[styles.metadataLabel, { color: themeStyles.secondaryTextColor }]}>
                  Artist
                </Text>
                <Text style={[styles.metadataValue, { color: themeStyles.textColor }]}>
                  {lyric.artist}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: themeStyles.dividerColor }]} />

            <View style={styles.metadataItem}>
              <Icon name="library-music" size={24} color={themeStyles.accentColor} />
              <View style={styles.metadataText}>
                <Text style={[styles.metadataLabel, { color: themeStyles.secondaryTextColor }]}>
                  Genre
                </Text>
                <Text style={[styles.metadataValue, { color: themeStyles.textColor }]}>
                  {genre}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.contentCard, { backgroundColor: themeStyles.cardColor }]}>
          <Text style={[styles.contentText, { color: themeStyles.textColor }]}>
            {lyric.content}
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    overflow: 'hidden',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerArtist: {
    fontSize: 18,
    opacity: 0.9,
  },
  headerScrollTitle: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  metadataContainer: {
    padding: 20,
  },
  metadataCard: {
    borderRadius: 16,
    padding: 20,
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
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: 16,
    flex: 1,
  },
  metadataLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  contentCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
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
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  shareButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 2,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
