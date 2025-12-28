import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Modern SafeArea
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { searchMovies, getGenres, getMoviesByGenre } from "../services/movieSearch";

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadGenres() {
      try {
        const genreData = await getGenres();
        setGenres([{ id: null, name: "All" }, ...genreData]);
      } catch (e) {
        console.error("Failed to load genres", e);
      }
    }
    loadGenres();
  }, []);

  const performSearch = async () => {
    setLoading(true);
    try {
      let data = [];
      if (query.length > 0) {
        data = await searchMovies(query);
        if (selectedGenre) {
          data = data.filter(movie => 
            movie.genre_ids && movie.genre_ids.includes(selectedGenre)
          );
        }
      } else if (selectedGenre) {
        data = await getMoviesByGenre(selectedGenre);
      } else {
        data = [];
      }
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedGenre]);

  // Updated List Item Layout
  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieListItem}
      onPress={() => navigation.navigate("MovieDetails", { movie: item })}
    >
      <Image
        source={{
          uri: item.poster_path
            ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
            : "https://via.placeholder.com/185x278?text=No+Image",
        }}
        style={styles.listPoster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
          </Text>
          <Text style={styles.releaseDate}>
             • {item.release_date ? item.release_date.split('-')[0] : ''}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#444" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Search movies..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={(text) => setQuery(text)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={performSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.genreListContainer}>
        <FlatList
          horizontal
          data={genres}
          keyExtractor={(item) => (item.id ? item.id.toString() : "all")}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedGenre(item.id)}
              style={[
                styles.genreBadge,
                selectedGenre === item.id && styles.genreBadgeActive,
              ]}
            >
              <Text style={[
                styles.genreText,
                selectedGenre === item.id && styles.genreTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e50914" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1} // Changed to 1 column for list view
          renderItem={renderMovieItem}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {query.length > 0 || selectedGenre 
                ? "No movies match your search." 
                : "Search by name or select a category"}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  searchHeader: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    alignItems: "center",
  },
  input: { flex: 1, color: "#fff", fontSize: 16, marginLeft: 10 },
  searchButton: {
    marginLeft: 12,
    backgroundColor: "#e50914",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchButtonText: { color: "#fff", fontWeight: "bold" },
  genreListContainer: { height: 50, marginBottom: 5 },
  genreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    marginRight: 8,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
    height: 36,
  },
  genreBadgeActive: { backgroundColor: "#e50914", borderColor: "#e50914" },
  genreText: { color: "#AAA", fontSize: 13 },
  genreTextActive: { color: "#fff", fontWeight: "bold" },
  
  // List Styles
  movieListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    paddingRight: 10,
  },
  listPoster: {
    width: 70,
    height: 100,
    backgroundColor: "#1A1A1A",
  },
  movieInfo: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  movieTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#FFD700",
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 14,
  },
  releaseDate: {
    color: "#888",
    fontSize: 14,
    marginLeft: 5,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 100,
    fontSize: 14,
  },
});