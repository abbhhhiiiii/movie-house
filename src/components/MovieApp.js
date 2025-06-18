import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AiOutlineSearch } from 'react-icons/ai';
import './MovieApp.css';

const MovieRecommendations = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [activeSection, setActiveSection] = useState('all');

  const trendingRef = useRef(null);
  const newReleasesRef = useRef(null);
  const allRef = useRef(null);

  const apiKey = '0fa2853e7c4d6c8f146aba861c5e4a06';

  useEffect(() => {
    axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
      .then(res => setGenres(res.data.genres));

    axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`)
      .then(res => setTrendingMovies(res.data.results.slice(0, 6)));

    axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`)
      .then(res => setNewReleases(res.data.results.slice(0, 6)));
  }, []);

  useEffect(() => {
    axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: {
        api_key: apiKey,
        sort_by: 'popularity.desc',
        with_genres: selectedGenre || undefined,
      }
    }).then(res => setMovies(res.data.results.slice(0, 12)));
  }, [selectedGenre]);

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    const res = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: { api_key: apiKey, query: searchQuery }
    });
    setMovies(res.data.results);
    setActiveSection('search');
    setSearchSuggestions([]);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    handleSearchSubmit();
  };

  const getPoster = path =>
    path
      ? `https://image.tmdb.org/t/p/w500${path}`
      : 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg';

  const scrollToSection = section => {
    setActiveSection(section);
    const ref = section === 'trending' ? trendingRef : section === 'new' ? newReleasesRef : allRef;
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderMovieCard = movie => (
    <div className="movie" key={movie.id}>
      <img src={getPoster(movie.poster_path)} alt={movie.title} />
      <div className="movie-info">
        <h2>
          {movie.title}
          <span className="rating">⭐ {movie.vote_average?.toFixed(1)}</span>
        </h2>
        <p>{movie.overview ? movie.overview.slice(0, 100) + '...' : 'No overview available.'}</p>
        <div className="movie-links">
          <a href={`https://news.google.com/search?q=${movie.title}`} target="_blank" rel="noopener noreferrer">Read More</a>
          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`} target="_blank" rel="noopener noreferrer">Watch Trailer</a>
        </div>
      </div>
    </div>
  );

  const fetchSearchSuggestions = async (query) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const res = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: { api_key: apiKey, query }
    });
    setSearchSuggestions(res.data.results.slice(0, 5));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSearchSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <div className="container">
      <h1>MovieHouse 🎬</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button onClick={handleSearchSubmit}>
          <AiOutlineSearch size={22} />
        </button>
        {searchSuggestions.length > 0 && (
          <ul className="suggestions">
            {searchSuggestions.map(movie => (
              <li key={movie.id} onClick={() => handleSuggestionClick(movie.title)}>
                {movie.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="filters">
        <select onChange={e => scrollToSection(e.target.value)}>
          <option value="all">All Movies</option>
          <option value="trending">Trending</option>
          <option value="new">New Releases</option>
        </select>
        <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {activeSection !== 'search' && (
        <>
          <h2 className="section-title" ref={trendingRef}>🔥 Trending</h2>
          <div className="movie-wrapper">{trendingMovies.map(renderMovieCard)}</div>

          <h2 className="section-title" ref={newReleasesRef}>🆕 New Releases</h2>
          <div className="movie-wrapper">{newReleases.map(renderMovieCard)}</div>
        </>
      )}

      <h2 className="section-title" ref={allRef}>
        {activeSection === 'search' ? '🔍 Search Results' : '🎯 All Movies'}
      </h2>
      <div className="movie-wrapper">{movies.map(renderMovieCard)}</div>
    </div>
  );
};

export default MovieRecommendations;
