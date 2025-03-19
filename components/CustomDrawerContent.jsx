import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../app/context/ThemeContext';

export default function CustomDrawerContent(props) {
  const { navigation } = props;
  const { theme, toggleTheme, themeStyles } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <Text style={[styles.header, { color: themeStyles.textColor }]}>My Lyrics</Text>
      
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Icon name="home" size={24} color={themeStyles.textColor} />
        <Text style={[styles.drawerItemText, { color: themeStyles.textColor }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => navigation.navigate('AddLyrics')}
      >
        <Icon name="add" size={24} color={themeStyles.textColor} />
        <Text style={[styles.drawerItemText, { color: themeStyles.textColor }]}>Add Lyrics</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => navigation.navigate('GenresScreen')}
      >
        <Icon name="library-music" size={24} color={themeStyles.textColor} />
        <Text style={[styles.drawerItemText, { color: themeStyles.textColor }]}>Genre List</Text>
      </TouchableOpacity>


      <View style={styles.toggleContainer}>
        <Text style={[styles.toggleText, { color: themeStyles.textColor }]}>
          Dark Mode
        </Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          thumbColor={theme === 'dark' ? '#bb86fc' : '#6200ee'}
          trackColor={{ false: '#ccc', true: '#333' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  drawerItemText: {
    fontSize: 18,
    marginLeft: 16,
  },
  toggleContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 18,
  },
});
