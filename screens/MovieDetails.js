import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Button,
  Dimensions,
  Platform,
  ActivityIndicator,
  TouchableOpacity, 
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { getMovieDetails, getMovieTrailer, getMovieExternalIds } from "../services/movieService";
import { AuthContext } from "../context/AuthContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const placeholder = "https://via.placeholder.com/200x300.png?text=No+Image";

export default function MovieDetails({ route }) {
  const { movie } = route.params;
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [details, setDetails] = useState({});
  const [trailerKey, setTrailerKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watchUrl, setWatchUrl] = useState(null);
  const [imdbId, setImdbId] = useState(null);

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
        setIsLoading(false);
      }
    }
    fetchData();
  }, [movie.id]);

  const handleWatch = () => {
    // This only triggers if user is logged in because the button is disabled otherwise
    if (imdbId) {
      setWatchUrl(`https://vidsrc.me/embed/movie?imdb=${imdbId}`);
    } else {
      setWatchUrl(`https://vidsrc.me/embed/movie?tmdb=${movie.id}`);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#e50914" />
            <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
          </View>
        ) : (
          <>
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
                  <Text style={styles.ratingText}>
                    {details.vote_average?.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Trailer Section - Always Available */}
            {trailerKey && (
              <View style={styles.videoSection}>
                <Text style={styles.sectionTitle}>Trailer</Text>
                {Platform.OS === "web" ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
                    width={SCREEN_WIDTH - 20}
                    height="220"
                    style={{ borderRadius: 12, border: "none", marginHorizontal: 10 }}
                    allowFullScreen
                  />
                ) : (
                  <WebView
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    source={{ uri: `https://www.youtube.com/embed/${trailerKey}` }}
                  />
                )}
              </View>
            )}

            <View style={styles.description}>
              <Text style={styles.descriptionText}>{details.overview}</Text>
            </View>

            {/* Watch Button - Disabled if not logged in */}
            <View style={styles.watchButton}>
              <Button
                title={user ? "Watch Movie Full HD" : "Login to Watch"}
                color="#e50914"
                onPress={handleWatch}
                disabled={!user} 
              />
              {!user && (
                <Text style={styles.loginHint}>
                  Unlock the full movie by signing in on the Profile tab.
                </Text>
              )}
            </View>

            {/* Movie Player Section - Restored Web & Mobile logic */}
            {watchUrl && (
              <View style={styles.videoSection}>
                <Text style={styles.sectionTitle}>Movie Player</Text>
                {Platform.OS === "web" ? (
                  <iframe
                    src={watchUrl}
                    width={SCREEN_WIDTH - 20}
                    height="400"
                    style={{ borderRadius: 12, border: "none", marginHorizontal: 10 }}
                    allowFullScreen
                  />
                ) : (
                  <WebView
                    style={[styles.webview, { height: 250 }]}
                    originWhitelist={["*"]}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsInlineMediaPlayback={true}
                    allowsFullscreenVideo={true}
                    source={{ uri: watchUrl }}
                  />
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: { backgroundColor: "#000", zIndex: 10 },
  backButton: { width: 50, height: 50, justifyContent: "center", alignItems: "center", marginLeft: 10, marginTop: Platform.OS === "android" ? 30 : 0 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  header: { flexDirection: "row", marginHorizontal: 20, marginTop: 10 },
  poster: { width: 120, height: 180, borderRadius: 10 },
  headerText: { flex: 1, marginLeft: 20, justifyContent: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  rating: { marginTop: 10, backgroundColor: "#e50914", alignSelf: "flex-start", borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8 },
  ratingText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  videoSection: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { color: "#fff", marginLeft: 20, marginBottom: 10, fontSize: 18, fontWeight: "600" },
  webview: { width: SCREEN_WIDTH - 20, height: 220, borderRadius: 12, marginHorizontal: 10, backgroundColor: "#000" },
  description: { marginHorizontal: 20, marginTop: 10 },
  descriptionText: { color: "#fff", fontSize: 16, lineHeight: 24 },
  watchButton: { marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
  loginHint: { color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 }
});