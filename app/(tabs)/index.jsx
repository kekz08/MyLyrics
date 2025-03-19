import React, { useState, useEffect } from 'react';
import { View, Button } from 'react-native';
import { Link } from 'expo-router';
import { loadLyrics, saveLyrics } from '../../utils/storage';
import LyricsList from '../../components/LyricsList';
import LyricsForm from '../../components/LyricsForm';

export default function HomeScreen() {
  const [lyrics, setLyrics] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchLyrics = async () => {
      const loadedLyrics = await loadLyrics();
      setLyrics(loadedLyrics);
    };
    fetchLyrics();
  }, []);

  const handleAdd = async (title, content, mood) => {
    const newLyric = { id: Date.now(), title, content, mood, date: new Date() };
    const updatedLyrics = [...lyrics, newLyric];
    setLyrics(updatedLyrics);
    await saveLyrics(updatedLyrics);
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    const updatedLyrics = lyrics.filter((lyric) => lyric.id !== id);
    setLyrics(updatedLyrics);
    await saveLyrics(updatedLyrics);
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {isAdding ? (
        <LyricsForm onSubmit={handleAdd} />
      ) : (
        <Button title="Add Lyrics" onPress={() => setIsAdding(true)} />
      )}
      <LyricsList lyrics={lyrics} onDelete={handleDelete} />
    </View>
  );
}