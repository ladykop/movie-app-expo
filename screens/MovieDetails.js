import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, ScrollView, Button, Dimensions, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { getMovieDetails, getMovieTrailer, getMovieExternalIds } from "../services/movieService";

const SCREEN_WIDTH = Dimensions.get("window").width;
const placeholder = "https://via.placeholder.com/200x300.png?text=No+Image";

export default function MovieDetails({ route }) {
  const { movie } = route.params;
  const [details, setDetails] = useState({});
  const [trailerKey, setTrailerKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watchUrl, setWatchUrl] = useState(
    "https://img.freepik.com/free-vector/cinema-room-background_1017-8728.jpg?w=740&t=st=1683584731"
  );
  const [imdbId, setImdbId] = useState(null);

  // Fetch movie details, trailer, and external IDs
  useEffect(() => {
    async function fetchData() {
      try {
        const detailsData = await getMovieDetails(movie.id);
        setDetails(detailsData);

        const trailer = await getMovieTrailer(movie.id);
        setTrailerKey(trailer);

        const externalIds = await getMovieExternalIds(movie.id);
        setImdbId(externalIds.imdb_id);

        setIsLoading(false);
      } catch (error) {
        console.log("Error fetching movie data:", error);
      }
    }
    fetchData();
  }, [movie.id]);

  // Handle "Watch Movie" button click
  const handleWatch = () => {
    setWatchUrl("https://v2.vidsrc.me/embed/");
  };

  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 50 }}>Loading...</Text>
      ) : (
        <>
          {/* Header: Poster + Title + Rating */}
          <View style={styles.header}>
            <Image
              source={{
                uri: details.poster_path
                  ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                  : placeholder,
              }}
              style={styles.poster}
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>{details.title}</Text>
              <View style={styles.rating}>
                <Text style={styles.ratingText}>{details.vote_average}</Text>
              </View>
            </View>
          </View>

          {/* Trailer */}
          {trailerKey && (
            <View style={styles.trailer}>
              {Platform.OS === "web" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  width={SCREEN_WIDTH - 20}
                  height="200"
                  style={{ borderRadius: 12, border: "none", marginHorizontal: 10 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <WebView
                  source={{ uri: `https://www.youtube.com/embed/${trailerKey}` }}
                  style={{ width: SCREEN_WIDTH - 20, height: 200, borderRadius: 12, marginHorizontal: 10 }}
                  allowsFullscreenVideo
                />
              )}
            </View>
          )}

          {/* Description */}
          <View style={styles.description}>
            <Text style={styles.descriptionText}>{details.overview}</Text>
          </View>

          {/* Watch Movie Button */}
          <View style={styles.watchButton}>
            <Button title="Watch Movie Here 🎬" color="#e50914" onPress={handleWatch} />
          </View>

          {/* Watch Movie WebView */}
          {watchUrl && (
            <View style={styles.webviewContainer}>
              {Platform.OS === "web" ? (
                <iframe
                  src={watchUrl}
                  width={SCREEN_WIDTH - 20}
                  height="200"
                  style={{ borderRadius: 12, border: "none", marginHorizontal: 10 }}
                  allowFullScreen
                />
              ) : (
                <WebView
                  source={{ uri: watchUrl }}
                  style={{ width: SCREEN_WIDTH - 20, height: 200, borderRadius: 12, marginHorizontal: 10 }}
                  allowsFullscreenVideo
                />
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", marginHorizontal: 20, marginTop: 20 },
  poster: { width: 120, height: 180, borderRadius: 10 },
  headerText: { flex: 1, marginLeft: 20, justifyContent: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  rating: {
    marginTop: 10,
    backgroundColor: "#e50914",
    alignSelf: "flex-start",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  ratingText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  trailer: { marginTop: 20, marginBottom: 10 },
  description: { marginHorizontal: 20, marginTop: 10 },
  descriptionText: { color: "#fff", fontSize: 16, lineHeight: 24 },
  watchButton: { marginHorizontal: 20, marginTop: 20 },
  webviewContainer: { marginTop: 20, marginBottom: 30 },
});