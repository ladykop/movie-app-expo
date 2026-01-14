import axios from "axios";

// TMDB API configuration and movie fetching functions
const API_KEY = "152f41397d36a9af171b938124f0281c";
const BASE_URL = "https://api.themoviedb.org/3";

// Axios instance
const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: "en-US",
  },
});

// Popular movies (for Swiper)
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await tmdb.get("/movie/popular", { params: { page } });
    return response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path, // keep path for Swiper
      image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      overview: movie.overview,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
    }));
  } catch (error) {
    console.log("Error fetching popular movies:", error);
    return [];
  }
};

// Movies by category (Now Playing / Top Rated)
export const getMoviesByCategory = async (endpoint, page = 1) => {
  try {
    const response = await tmdb.get(endpoint, { params: { page } });
    return response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      rating: movie.vote_average,
      overview: movie.overview,
      releaseDate: movie.release_date,
    }));
  } catch (error) {
    console.log(`Error fetching movies by category (${endpoint}):`, error);
    return [];
  }
};

// Get all movie genres
export const getGenres = async () => {
  try {
    const response = await tmdb.get("/genre/movie/list");
    return response.data.genres; // [{id: 28, name: "Action"}, ...]
  } catch (error) {
    console.log("Error fetching genres:", error);
    return [];
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await tmdb.get("/discover/movie", {
      params: { with_genres: genreId, page },
    });
    return response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      rating: movie.vote_average,
      overview: movie.overview,
      releaseDate: movie.release_date,
    }));
  } catch (error) {
    console.log(`Error fetching movies for genre ${genreId}:`, error);
    return [];
  }
};
