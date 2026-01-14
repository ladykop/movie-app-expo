const API_KEY = "152f41397d36a9af171b938124f0281c";
const BASE_URL = "https://api.themoviedb.org/3";

// Search movies by query
export const searchMovies = async (query) => {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
  const data = await response.json();
  return data.results || [];
};

// Get genres
export const getGenres = async () => {
  const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  const data = await response.json();
  return data.genres || [];
};

// Get movies by genre
export const getMoviesByGenre = async (genreId) => {
  const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`);
  const data = await response.json();
  return data.results || [];
};