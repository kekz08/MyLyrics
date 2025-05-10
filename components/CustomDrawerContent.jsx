import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../app/context/ThemeContext';

export default function CustomDrawerContent(props) {
  const { navigation } = props;
  const { theme, toggleTheme, themeStyles } = useTheme();

  const renderDrawerItem = (icon, label, onPress) => (
    <TouchableOpacity
      style={[styles.drawerItem, { backgroundColor: themeStyles.surfaceColor }]}
      onPress={onPress}
    >
      <Icon name={icon} size={24} color={themeStyles.primaryColor} />
      <Text style={[styles.drawerItemText, { color: themeStyles.textColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <View style={[styles.headerContainer, { backgroundColor: themeStyles.headerColor }]}>
        <Image 
          source={require('../assets/images/splash-icon.png')} 
          style={styles.logo}
        />
        <Text style={[styles.header, { color: themeStyles.headerTextColor }]}>My Lyrics</Text>
      </View>

      <View style={styles.drawerItemsContainer}>
        {renderDrawerItem("home", "Home", () => navigation.navigate('Home'))}
        {renderDrawerItem("queue-music", "Playlists", () => navigation.navigate('Playlists'))}
        {renderDrawerItem("add", "Add Lyrics", () => navigation.navigate('AddLyrics'))}
        {renderDrawerItem("library-music", "Genre List", () => navigation.navigate('GenresScreen'))}
      </View>

      <View style={[styles.divider, { backgroundColor: themeStyles.dividerColor }]} />

      <View style={[styles.toggleContainer, { backgroundColor: themeStyles.surfaceColor }]}>
        <Icon name={theme === 'dark' ? 'nightlight-round' : 'wb-sunny'} 
              size={24} 
              color={themeStyles.primaryColor} />
        <Text style={[styles.toggleText, { color: themeStyles.textColor }]}>
          Dark Mode
        </Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          thumbColor={theme === 'dark' ? themeStyles.primaryColor : '#f4f3f4'}
          trackColor={{ 
            false: themeStyles.dividerColor, 
            true: `${themeStyles.primaryColor}80` 
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  drawerItemsContainer: {
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 5,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: 20,
  },
  toggleContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
    fontWeight: '500',
  },
});
