import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from "../context/AuthContext";
import {
  getPopularMovies,
  getMoviesByCategory,
  getGenres,
  getMoviesByGenre,
} from "../services/api";

const placeholder = "https://via.placeholder.com/200x300.png?text=No+Image";

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets(); // Hook to get device-specific spacing
  
  const [popularMovies, setPopularMovies] = useState([]);
  const [categories] = useState([
    { name: "Now Playing", endpoint: "/movie/now_playing" },
    { name: "Top Rated", endpoint: "/movie/top_rated" },
  ]);
  const [moviesByCategory, setMoviesByCategory] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [moviesByGenre, setMoviesByGenre] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [popular, genresData] = await Promise.all([
        getPopularMovies(),
        getGenres()
      ]);
      setPopularMovies(popular);
      setGenres(genresData);

      const categoryData = await Promise.all(
        categories.map((cat) => getMoviesByCategory(cat.endpoint))
      );
      setMoviesByCategory(categoryData);

      if (genresData.length > 0) {
        setSelectedGenre(genresData[0].id);
        const movies = await getMoviesByGenre(genresData[0].id);
        setMoviesByGenre(movies);
      }
    } catch (error) {
      console.error("API Load Error:", error);
    }
  };

  const handleGenreSelect = async (genreId) => {
    setSelectedGenre(genreId);
    const movies = await getMoviesByGenre(genreId);
    setMoviesByGenre(movies);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* --- SAFE AREA HEADER --- */}
      <View style={[
        styles.header, 
        { paddingTop: insets.top + 10 } // Dynamically adds space for the notch/status bar
      ]}>
        {user ? (
          <View style={styles.userProfile}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarLetter}>
                  {user.email?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineStatus} />
            </View>
            <Text style={styles.headerUsername} numberOfLines={1}>
              {user.displayName || user.email.split('@')[0]}
            </Text>
          </View>
        ) : (
          <Text style={styles.brandTitle}>BigRedButton</Text>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
           <Text style={styles.profileBtnText}>{user ? "Account" : "Sign In"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          contentContainerStyle={styles.featuredList}
        >
          {popularMovies.map((movie) => (
            <TouchableOpacity key={movie.id} onPress={() => navigation.navigate("MovieDetails", { movie })}>
              <Image
                source={{ uri: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : placeholder }}
                style={styles.featuredPoster}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Rows by Category */}
        {categories.map((category, index) => (
          <View key={category.name} style={styles.section}>
            <Text style={styles.sectionLabel}>{category.name}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
              {moviesByCategory[index]?.map((movie) => (
                <TouchableOpacity key={movie.id} style={styles.movieCard} onPress={() => navigation.navigate("MovieDetails", { movie })}>
                  <Image
                    source={{ uri: movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : placeholder }}
                    style={styles.poster}
                  />
                  <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}

        {/* Genre Selector */}
        <Text style={styles.sectionLabel}>Genres</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreRow}>
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              onPress={() => handleGenreSelect(genre.id)}
              style={[styles.genrePill, selectedGenre === genre.id && styles.activePill]}
            >
              <Text style={styles.genrePillText}>{genre.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Genre Result List */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {moviesByGenre.map((movie) => (
            <TouchableOpacity key={movie.id} style={styles.movieCard} onPress={() => navigation.navigate("MovieDetails", { movie })}>
              <Image
                source={{ uri: movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : placeholder }}
                style={styles.poster}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Bottom Spacing for Navigation Bars */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000" },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    // We handle paddingTop dynamically in the component
  },
  userProfile: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: "relative" },
  avatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  avatarLetter: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  onlineStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#39FF14", 
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#000",
  },
  headerUsername: { color: "#fff", marginLeft: 10, fontSize: 16, fontWeight: "600" },
  brandTitle: { color: "#FF0000", fontSize: 22, fontWeight: "900", letterSpacing: -1 },
  profileBtnText: { color: "#FF0000", fontWeight: "bold", fontSize: 14 },

  featuredList: { paddingHorizontal: 15, paddingVertical: 15 },
  featuredPoster: { width: 200, height: 300, borderRadius: 15, marginRight: 15 },
  section: { marginTop: 25 },
  sectionLabel: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 20, marginBottom: 15 },
  row: { paddingLeft: 20 },
  movieCard: { marginRight: 15, width: 110 },
  poster: { width: 110, height: 165, borderRadius: 10 },
  movieTitle: { color: "#888", fontSize: 11, marginTop: 5 },
  genreRow: { paddingLeft: 20, marginBottom: 15 },
  genrePill: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, backgroundColor: "#1a1a1a", marginRight: 10 },
  activePill: { backgroundColor: "#FF0000" },
  genrePillText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});