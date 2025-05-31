import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, Loader2 } from 'lucide-react'
import useMoviesData from '../hooks/useMoviesData'
import FilterSort from './FilterSort'
import { useSettings } from '../context/SettingsContext' // DODANO

const MoviesGrid = () => {
  const { movies, loading } = useMoviesData()
  const { settings } = useSettings() // DODANO
  const navigate = useNavigate()
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')
  
  // DODANO: Load More functionality
  const [visibleCount, setVisibleCount] = useState(12)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Wyodrębnij unikalne gatunki
  const genres = useMemo(() => {
    const allGenres = new Set()
    movies.forEach(movie => {
      if (movie.genre) {
        movie.genre.split(',').forEach(g => {
          allGenres.add(g.trim())
        })
      }
    })
    return Array.from(allGenres).sort()
  }, [movies])

  // Filtruj i sortuj filmy
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = [...movies]

    // Filtrowanie po gatunku
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie => 
        movie.genre && movie.genre.includes(selectedGenre)
      )
    }

    // Sortowanie
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'popularity':
        filtered.sort((a, b) => parseInt(b.reviews) - parseInt(a.reviews))
        break
      case 'newest':
        filtered.sort((a, b) => {
          const yearA = parseInt(a.title.match(/\((\d{4})\)$/)?.[1] || 0)
          const yearB = parseInt(b.title.match(/\((\d{4})\)$/)?.[1] || 0)
          return yearB - yearA
        })
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    return filtered
  }, [movies, selectedGenre, sortBy])

  // DODANO: Reset visible count when filters change
  React.useEffect(() => {
    setVisibleCount(12)
  }, [selectedGenre, sortBy])

  // DODANO: Load More handler
  const handleLoadMore = () => {
    setIsLoadingMore(true)
    
    // Symulacja ładowania (można usunąć jeśli dane ładują się natychmiast)
    setTimeout(() => {
      setVisibleCount(prev => prev + 9) // Dodaj 9 kolejnych filmów
      setIsLoadingMore(false)
    }, 800) // Krótka przerwa dla lepszego UX
  }

  // DODANO: Calculate visible movies and remaining count
  const visibleMovies = filteredAndSortedMovies.slice(0, visibleCount)
  const remainingCount = filteredAndSortedMovies.length - visibleCount
  const hasMore = remainingCount > 0

  if (loading) {
    return (
      <div className="movies-container">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={32} />
          <p>Ładowanie filmów...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="movies-container">
      <FilterSort 
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        type="movies"
      />
      
      <div className="results-info">
        <span className="results-count">
          Wyświetlanie {visibleMovies.length} z {filteredAndSortedMovies.length} filmów
        </span>
        {selectedGenre !== 'all' && (
          <span className="results-filter"> w kategorii: <strong>{selectedGenre}</strong></span>
        )}
      </div>

      <div className="movies-grid">
        {visibleMovies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="movie-card"
            onClick={() => navigate(`/movie/${movie.id}`)}
            style={{
              animationDelay: settings.reduceMotion ? '0s' : `${(index % 9) * 0.1}s`, // Stagger animation
              transform: settings.reduceMotion ? 'none' : undefined,
              transition: settings.reduceMotion ? 'none' : undefined
            }}
          >
            <div className="movie-image">
              <img 
                src={movie.image} 
                alt={movie.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/250x350/d0d0d0/666?text=No+Image'
                }}
              />
              <button className="movie-play">▶</button>
            </div>
            <div className="movie-card-info">
              <h3 className="movie-card-title">{movie.title}</h3>
              <p className="movie-card-subtitle">{movie.subtitle}</p>
              <div className="movie-card-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(movie.rating) ? "#ffd700" : "#ddd"} 
                      color={i < Math.floor(movie.rating) ? "#ffd700" : "#ddd"}
                    />
                  ))}
                </div>
                <span className="reviews-count">{movie.reviews}</span>
              </div>
              <div className="movie-genre">{movie.genre.split(',')[0]}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ZAKTUALIZOWANY Load More Button */}
      {hasMore && (
        <div className="load-more-container">
          <div className="load-more-info">
            Pozostało jeszcze <strong>{remainingCount}</strong> {remainingCount === 1 ? 'film' : 'filmów'}
          </div>
          <button 
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            style={{
              transition: settings.reduceMotion ? 'none' : undefined
            }}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="loading-spinner" size={16} />
                Ładowanie...
              </>
            ) : (
              `Pokaż więcej (następne ${Math.min(9, remainingCount)})`
            )}
          </button>
        </div>
      )}

      {/* DODANO: End message when all loaded */}
      {!hasMore && filteredAndSortedMovies.length > 12 && (
        <div className="load-more-container">
          <div className="all-loaded-message">
            🎬 To wszystko! Wyświetlono wszystkie {filteredAndSortedMovies.length} filmów.
          </div>
        </div>
      )}
      
    </div>
  )
}

export default MoviesGrid
