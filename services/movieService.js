import axios from "axios";

const API_KEY = "152f41397d36a9af171b938124f0281c";
const BASE_URL = "https://api.themoviedb.org/3";

// Axios instance 
const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: "en-US",
  },
}); //we call "tmdb" instead of calling the url and api key everytime

// Get movie details by ID
export const getMovieDetails = async (movieId) => {
  const response = await tmdb.get(`/movie/${movieId}`);
  return response.data;
};

// Get movie trailer (YouTube)
export const getMovieTrailer = async (movieId) => {
  const response = await tmdb.get(`/movie/${movieId}/videos`);
  const trailer = response.data.results.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );
  return trailer ? trailer.key : null;
};

// Optional: Get external IDs (IMDB, etc.)
export const getMovieExternalIds = async (movieId) => {
  const response = await tmdb.get(`/movie/${movieId}/external_ids`);
  return response.data;
};