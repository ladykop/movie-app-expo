import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Swiper from "react-native-swiper";

import {
  getPopularMovies,
  getMoviesByCategory,
  getGenres,
  getMoviesByGenre,
} from "../services/api";

const placeholder = "https://via.placeholder.com/200x300.png?text=No+Image";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
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
    loadPopular();
    loadCategories();
    loadGenres();
  }, []);

  const loadPopular = async () => {
    const popular = await getPopularMovies();
    setPopularMovies(popular);
  };

  const loadCategories = async () => {
    const categoryData = await Promise.all(
      categories.map((cat) => getMoviesByCategory(cat.endpoint))
    );
    setMoviesByCategory(categoryData);
  };

  const loadGenres = async () => {
    const genresData = await getGenres();
    setGenres(genresData);
    if (genresData.length > 0) {
      setSelectedGenre(genresData[0].id);
      const movies = await getMoviesByGenre(genresData[0].id);
      setMoviesByGenre(movies);
    }
  };

  const handleGenreSelect = async (genreId) => {
    setSelectedGenre(genreId);
    const movies = await getMoviesByGenre(genreId);
    setMoviesByGenre(movies);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000" }} showsVerticalScrollIndicator={false}>
      
      {/* Featured / Popular movies Swiper */}
      <View style={{ height: 280, marginTop: 10 }}>
        <Swiper
          autoplay
          showsPagination
          dotColor="rgba(255,255,255,0.3)"
          activeDotColor="#e50914"
          containerStyle={{ marginBottom: 10 }}
        >
          {popularMovies.map((movie) => (
            <TouchableOpacity
              key={movie.id}
              onPress={() => navigation.navigate("Details", { movie })}
              activeOpacity={0.9}
              style={{ alignItems: "center" }}
            >
              <Image
                source={{
                  uri: movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : placeholder,
                }}
                style={{
                  width: 180,   // slightly larger than category cards (120)
                  height: 270,  // proportional height
                  borderRadius: 12,
                }}
              />
              <Text
                style={{
                  color: "#fff",
                  marginTop: 6,
                  fontSize: 16,
                  fontWeight: "bold",
                  width: 180,
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                {movie.title}
              </Text>
            </TouchableOpacity>
          ))}
        </Swiper>
      </View>


      {/* Categories (Now Playing / Top Rated) */}
      {categories.map((category, index) => (
        <View key={index}>
          <Text style={styles.sectionTitle}>{category.name}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 10 }}>
            {moviesByCategory[index]?.map((movie) => (
              <TouchableOpacity
                key={movie.id}
                onPress={() => navigation.navigate("Details", { movie })}
                style={{ marginRight: 10 }}
              >
                <Image
                  source={{ uri: movie.image || placeholder }}
                  style={styles.cardImage}
                />
                <Text style={styles.cardTitle} numberOfLines={1}>{movie.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      {/* Genres */}
      <Text style={styles.sectionTitle}>Genres</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 10, paddingBottom: 10 }}>
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            onPress={() => handleGenreSelect(genre.id)}
            style={[
              styles.genreButton,
              { backgroundColor: selectedGenre === genre.id ? "#e50914" : "#333" }
            ]}
          >
            <Text style={styles.genreText}>{genre.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Movies by Genre */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 10, paddingBottom: 20 }}>
        {moviesByGenre.map((movie) => (
          <TouchableOpacity
            key={movie.id}
            onPress={() => navigation.navigate("Details", { movie })}
            style={{ marginRight: 10 }}
          >
            <Image
              source={{ uri: movie.image || placeholder }}
              style={styles.cardImage}
            />
            <Text style={styles.cardTitle} numberOfLines={1}>{movie.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  poster: {
    width: SCREEN_WIDTH - 40,
    height: 250,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  posterTitle: {
    position: "absolute",
    bottom: 10,
    left: 30,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    marginVertical: 8,
  },
  cardImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  cardTitle: {
    color: "#fff",
    width: 120,
    marginTop: 4,
  },
  genreButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  genreText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
