import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Loader2 } from 'lucide-react'
import useTVShowsData from '../hooks/useTVShowsData'
import FilterSort from './FilterSort'
import { useSettings } from '../context/SettingsContext' // DODANO

const TVShowsGrid = () => {
  const { tvShows, loading } = useTVShowsData()
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
    tvShows.forEach(show => {
      if (show.genre) {
        show.genre.split(',').forEach(g => {
          allGenres.add(g.trim())
        })
      }
    })
    return Array.from(allGenres).sort()
  }, [tvShows])

  // Filtruj i sortuj seriale
  const filteredAndSortedShows = useMemo(() => {
    let filtered = [...tvShows]

    // Filtrowanie po gatunku
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(show => 
        show.genre && show.genre.includes(selectedGenre)
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
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    return filtered
  }, [tvShows, selectedGenre, sortBy])

  // DODANO: Reset visible count when filters change
  React.useEffect(() => {
    setVisibleCount(12)
  }, [selectedGenre, sortBy])

  // DODANO: Load More handler
  const handleLoadMore = () => {
    setIsLoadingMore(true)
    
    setTimeout(() => {
      setVisibleCount(prev => prev + 9) // Dodaj 9 kolejnych seriali
      setIsLoadingMore(false)
    }, 800)
  }

  // DODANO: Calculate visible shows and remaining count
  const visibleShows = filteredAndSortedShows.slice(0, visibleCount)
  const remainingCount = filteredAndSortedShows.length - visibleCount
  const hasMore = remainingCount > 0

  if (loading) {
    return (
      <div className="tv-shows-container">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={32} />
          <p>Ładowanie seriali...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tv-shows-container">
      <FilterSort 
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        type="tvshows"
      />
      
      <div className="results-info">
        <span className="results-count">
          Wyświetlanie {visibleShows.length} z {filteredAndSortedShows.length} seriali
        </span>
        {selectedGenre !== 'all' && (
          <span className="results-filter"> w kategorii: <strong>{selectedGenre}</strong></span>
        )}
      </div>

      <div className="tv-shows-grid">
        {visibleShows.map((show, index) => (
          <div 
            key={show.id} 
            className="tv-show-card"
            onClick={() => navigate(`/tv-show/${show.id}`)}
            style={{ 
              cursor: 'pointer',
              animationDelay: settings.reduceMotion ? '0s' : `${(index % 9) * 0.1}s`,
              transform: settings.reduceMotion ? 'none' : undefined,
              transition: settings.reduceMotion ? 'none' : undefined
            }}
          >
            <div className="tv-show-image">
              <img 
                src={show.image} 
                alt={show.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/250x350/d0d0d0/666?text=No+Image'
                }}
              />
              <button 
                className="tv-show-play"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                ▶
              </button>
            </div>
            <div className="tv-show-info">
              <h3 className="tv-show-title">{show.title}</h3>
              <p className="tv-show-subtitle">{show.subtitle}</p>
              <div className="tv-show-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(show.rating) ? "#ffd700" : "#ddd"} 
                      color={i < Math.floor(show.rating) ? "#ffd700" : "#ddd"}
                    />
                  ))}
                </div>
                <span className="reviews-count">{show.reviews}</span>
              </div>
              <div className="tv-show-genre">{show.genre.split(',')[0]}</div>
              {show.episodeRuntime && (
                <div className="tv-show-episode-time">
                  Odcinek: {show.episodeRuntime}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* ZAKTUALIZOWANY Load More Button */}
      {hasMore && (
        <div className="load-more-container">
          <div className="load-more-info">
            Pozostało jeszcze <strong>{remainingCount}</strong> {remainingCount === 1 ? 'serial' : 'seriali'}
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
      {!hasMore && filteredAndSortedShows.length > 12 && (
        <div className="load-more-container">
          <div className="all-loaded-message">
            📺 To wszystko! Wyświetlono wszystkie {filteredAndSortedShows.length} seriali.
          </div>
        </div>
      )}
    </div>
  )
}

export default TVShowsGrid
