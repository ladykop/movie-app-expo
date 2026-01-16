# Big Red Button
A React Native mobile application built with Expo that allows users to browse, search, and watch movies. The app integrates with The Movie Database (TMDB) API for movie data and uses Firebase for user authentication and data storage.

## Features
- **Browse Movies**: View popular movies, movies by category (Now Playing, Top Rated), and filter by genre
- **Search Functionality**: Search for movies by title with optional genre filtering
- **Movie Details**: View detailed information, trailers, and ratings for each movie
- **User Authentication**: Sign up, log in, and manage user profiles with Firebase
- **Watch Movies**: Stream movies directly in the app (requires login)
- **Profile Management**: Update username, change password, and delete account

## Technologies Used
- **React Native**: Framework for building native mobile apps using React
- **Expo**: Platform for building and deploying React Native apps
- **Firebase**: Backend services for authentication and database
  - Firebase Authentication for user login/signup
  - Firestore for storing user data
- **The Movie Database (TMDB) API**: Source of movie data, posters, trailers, and details
- **React Navigation**: Navigation library for managing app screens
- **Axios**: HTTP client for API requests
- **Expo Vector Icons**: Icon library for UI elements
- **React Native Safe Area Context**: Handles safe area insets for different devices

## Project Structure
```
movie-app-expo/
├── App.js                 # Main app component with navigation setup
├── app.json              # Expo configuration
├── firebaseConfig.js     # Firebase configuration
├── index.js              # App entry point
├── package.json          # Dependencies and scripts
├── assets/               # Static assets (images, icons)
├── context/
│   └── AuthContext.js    # Authentication context provider
├── screens/
│   ├── HomeScreen.js     # Home screen with movie browsing
│   ├── MovieDetails.js   # Movie details and watch functionality
│   ├── Profile.js        # User profile and authentication
│   └── SearchScreen.js   # Movie search interface
└── services/
    ├── api.js           # TMDB API functions for movies and genres
    ├── movieSearch.js   # Search-specific API functions
    └── movieService.js  # Movie details and trailer API functions
```

## Installation and Setup

1. **Prerequisites**:
   - Node.js (v14 or later)
   - npm or yarn
   - Expo CLI: `npm install -g @expo/cli`
   - Expo Go app on your mobile device

2. **Firebase Setup**:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication and Firestore
   - Update `firebaseConfig.js` with your Firebase config

3. **TMDB API Setup**:
   - Get an API key from https://www.themoviedb.org/settings/api
   - The API key is already configured in the service files

4. **Run the App**:
   ```bash
   npx expo start
   ```
   - Scan the QR code with Expo Go on your device
   - Or press 'a' for Android emulator, 'i' for iOS simulator

## Key Components

### App.js
Sets up the main navigation structure with a bottom tab navigator for Home, Search, and Profile screens, and a stack navigator for the MovieDetails screen.

### AuthContext.js
Provides authentication state management using Firebase Auth. Listens for auth state changes and provides user data to child components.

### HomeScreen.js
Displays a curated feed of movies including:
- Horizontal swiper for popular movies
- Category sections (Now Playing, Top Rated)
- Genre filter with movie lists

### SearchScreen.js
Features a search bar and genre filter. Uses debounced search to query TMDB API and displays results in a list format.

### MovieDetails.js
Shows comprehensive movie information including poster, description, rating, trailer video, and a watch button that opens the movie player.

### Profile.js
Handles user authentication UI and profile management. Includes forms for login/register, profile editing, and account deletion.

### API Services
- `api.js`: Core TMDB API functions for fetching movies, categories, and genres
- `movieSearch.js`: Specialized functions for search and genre filtering
- `movieService.js`: Functions for detailed movie data, trailers, and external IDs

## API Usage
The app uses TMDB API v3 with the following endpoints:
- `/movie/popular` - Popular movies
- `/movie/{category}` - Movies by category (now_playing, top_rated)
- `/genre/movie/list` - Available genres
- `/discover/movie` - Movies by genre
- `/search/movie` - Search movies by query
- `/movie/{id}` - Movie details
- `/movie/{id}/videos` - Movie trailers
- `/movie/{id}/external_ids` - External IDs (IMDB, etc.)

## Authentication Flow
1. Users can browse movies without logging in
2. Watching movies requires authentication
3. Firebase handles user registration, login, and password reset
4. User data is stored in Firestore
5. Auth state is managed globally via React Context

## Movie Watching
- Movies are streamed using external video services (vidsrc.me)
- Requires user login to access watch functionality
- Supports both IMDB and TMDB IDs for better compatibility
- Embedded video player using WebView component

