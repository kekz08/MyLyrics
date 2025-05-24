# MyLyrics - Lyrics Management App

MyLyrics is a React Native mobile application that helps users manage and organize their favorite song lyrics. The app provides features for adding, editing, searching, and organizing lyrics into playlists.

## Features

### Core Features
- 📝 Add and edit lyrics with title, artist, and content
- 🔍 Search functionality with advanced filters
- 🎵 Organize lyrics into playlists
- ⭐ Mark favorite lyrics
- 🏷️ Categorize lyrics by genres
- 🔄 Pull-to-refresh for updating content
- 🌓 Dark/Light theme support
- 🌐 Online lyrics search via Genius API

### Search Capabilities
- Quick search across title, artist, and content
- Advanced search with multiple filters
- Search history tracking
- Clear search history option
- Online lyrics search via Genius API

### Playlist Management
- Create custom playlists
- Add/remove songs from playlists
- View playlist contents
- Track number of songs in each playlist

### User Experience
- Smooth animations and transitions
- Intuitive UI with modern design
- Responsive layout
- Error handling and user feedback

## Project Structure

```
MyLyrics/
├── app/
│   ├── context/
│   │   └── ThemeContext.jsx    # Theme management
│   └── navigation/
│       └── AppNavigator.jsx    # Navigation configuration
├── screens/
│   ├── HomeScreen.jsx         # Main screen with lyrics list
│   ├── AddLyricsScreen.jsx    # Add new lyrics
│   ├── EditLyricsScreen.jsx   # Edit existing lyrics
│   ├── LyricsDetailScreen.jsx # View lyrics details
│   ├── PlaylistsScreen.jsx    # Playlist management
│   ├── OnlineLyricsSearch.jsx # Search lyrics online
│   └── AddLyricsScreen.jsx    # Add lyrics from online search
├── utils/
│   └── storage.js             # Data persistence utilities
└── assets/                    # Images and other static assets
```

## Technical Details

### Dependencies
- React Native
- React Navigation
- AsyncStorage for data persistence
- React Native Vector Icons

### Data Structure

#### Lyrics Object
```javascript
{
  id: string,
  title: string,
  artist: string,
  content: string,
  genreId: string,
  createdAt: string,
  updatedAt: string
}
```

#### Playlist Object
```javascript
{
  id: string,
  name: string,
  lyricsIds: string[],
  createdAt: string,
  updatedAt: string
}
```

#### Genre Object
```javascript
{
  id: string,
  name: string
}
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/MyLyrics.git
cd MyLyrics
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

5. Run on iOS:
```bash
npm run ios
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Native community
- All contributors who have helped shape this project
