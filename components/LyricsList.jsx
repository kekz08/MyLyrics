import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { Link } from 'expo-router';

const LyricsList = ({ lyrics, onDelete }) => {
  return (
    <FlatList
      data={lyrics}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Link href={`/lyrics/${item.id}`}>
            <Text style={styles.title}>{item.title}</Text>
          </Link>
          <Text>{item.content}</Text>
          <Text>Mood: {item.mood}</Text>
          <Button title="Delete" onPress={() => onDelete(item.id)} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LyricsList;