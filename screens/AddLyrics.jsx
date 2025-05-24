import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AddLyrics({ navigation, route }) {
  const handleOnlineSearch = () => {
    navigation.navigate('OnlineLyricsSearch');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.onlineSearchButton, { backgroundColor: themeStyles.primaryColor }]}
          onPress={handleOnlineSearch}
        >
          <Icon name="search" size={20} color="#FFFFFF" />
          <Text style={styles.onlineSearchText}>Search Online</Text>
        </TouchableOpacity>
      </View>

      {/* Rest of your existing form */}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  onlineSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  onlineSearchText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 