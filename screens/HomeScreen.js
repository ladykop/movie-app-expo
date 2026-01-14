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
} from "../services/api"; // Imported api functions

const placeholder = "https://via.placeholder.com/200x300.png?text=No+Image"; // so instead of typing the whole url, we just call "placeholder"

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  
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
      
      {/* --- HEADER WITH USER CAPSULE --- */}
      <View style={[
        styles.header, 
        { paddingTop: insets.top + 10 }
      ]}>
        {user ? (
          <TouchableOpacity 
            style={styles.userCapsule} 
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={styles.avatarMini}>
              <Text style={styles.avatarLetter}>
                {user.email?.charAt(0).toUpperCase()}
              </Text>
              <View style={styles.onlineStatusMini} />
            </View>
            <Text style={styles.headerUsername} numberOfLines={1}>
              {user.displayName || user.email.split('@')[0]}
            </Text>
          </TouchableOpacity>
        ) : (
          <Image 
            source={require("../assets/title.png")} 
            style={styles.brandImage}
            resizeMode="contain" 
          />
        )}
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
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },

  // USER CAPSULE STYLE
  userCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    padding: 5,
    paddingRight: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF0000', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  onlineStatusMini: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#39FF14',
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 1.5,
    borderColor: '#000',
  },
  headerUsername: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    maxWidth: 120,
  },

  brandImage: {
    width: 150,
    height: 30,    
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
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
