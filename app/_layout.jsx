import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import GenresScreen from '../screens/GenresScreen';
import AddLyricsScreen from '../screens/AddLyricsScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import LyricsDetailScreen from '../screens/LyricsDetailScreen';
import EditLyricsScreen from '../screens/EditLyricsScreen';
import SplashScreen from '../screens/SplashScreen';
import AddGenreScreen from '../screens/AddGenreScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import OnlineLyricsSearch from '../screens/OnlineLyricsSearch';
import { ThemeProvider, useTheme } from '../app/context/ThemeContext';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerNavigator() {
  const { themeStyles, isDarkMode } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: themeStyles.headerColor,
        },
        headerTintColor: themeStyles.headerTextColor,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 15 }}
            onPress={() => navigation.toggleDrawer()}
          >
            <Icon name="menu" size={24} color={themeStyles.headerTextColor} />
          </TouchableOpacity>
        ),

        headerRight: () => (
          <Image
            source={
              isDarkMode
                ? require('../assets/images/logob.png') // Dark mode logo
                : require('../assets/images/logo.png') // Light mode logo
            }
            style={{
              width: 40,
              height: 40,
              marginRight: 15,
            }}
            resizeMode="contain"
          />
        ),
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'My Lyrics' }}
      />
      <Drawer.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{ title: 'My Playlists' }}
      />
      <Drawer.Screen
        name="GenresScreen"
        component={GenresScreen}
        options={{ title: 'Manage Genres' }}
      />
      <Drawer.Screen
        name="AddGenreScreen"
        component={AddGenreScreen}
        options={{ title: 'Add Genre' }}
      />
      <Drawer.Screen
        name="AddLyrics"
        component={AddLyricsScreen}
        options={{ title: 'Add Lyrics' }}
      />
      <Drawer.Screen
        name="LyricsDetail"
        component={LyricsDetailScreen}
        options={{
          title: 'Lyric Details',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="EditLyrics"
        component={EditLyricsScreen}
        options={{
          title: 'Edit Lyric',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="PlaylistDetail"
        component={PlaylistDetailScreen}
        options={{
          title: 'Playlist',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnlineLyricsSearch"
          component={OnlineLyricsSearch}
          options={{
            title: 'Search Lyrics Online',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AddLyricsScreen"
          component={AddLyricsScreen}
          options={{
            title: 'Add Lyrics',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </ThemeProvider>
  );
}
