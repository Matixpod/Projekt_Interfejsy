import React, { useState, useEffect } from 'react'
import { Star, Film, ChevronLeft, ChevronRight } from 'lucide-react' // Zmieniono: dodano Film, usunięto Play i Plus
import { Link } from 'react-router-dom' // DODANO: Import Link
import useMoviesData from '../hooks/useMoviesData'
import { useSettings } from '../context/SettingsContext'

const MovieSpotlight = () => {
  const { movies, loading } = useMoviesData()
  const { settings } = useSettings()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Wybierz top 8 najlepiej ocenianych filmów do carousel
  const spotlightMovies = movies
    .filter(movie => movie.rating > 4.0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)

  // Prosta auto-zmiana co 5 sekund
  useEffect(() => {
    if (!settings.reduceMotion && spotlightMovies.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => prev === spotlightMovies.length - 1 ? 0 : prev + 1)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [spotlightMovies.length, settings.reduceMotion])

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(prev => prev === spotlightMovies.length - 1 ? 0 : prev + 1)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handlePrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(prev => prev === 0 ? spotlightMovies.length - 1 : prev - 1)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  if (loading) {
    return (
      <section className="movie-spotlight">
        <div className="spotlight-placeholder">
          <div className="spotlight-content">
            <div className="loading-text">Ładowanie filmów...</div>
          </div>
        </div>
      </section>
    )
  }

  if (spotlightMovies.length === 0) {
    return (
      <section className="movie-spotlight">
        <div className="spotlight-placeholder">
          <div className="spotlight-content">
            <div className="loading-text">Brak dostępnych filmów</div>
          </div>
        </div>
      </section>
    )
  }

  const currentMovie = spotlightMovies[currentIndex]

  return (
    <section className="movie-spotlight">
      <div className="spotlight-container">
        <div className="spotlight-image">
          <img 
            src={currentMovie.image} 
            alt={currentMovie.title}
            className={isTransitioning ? 'transitioning' : ''}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<div class="image-placeholder">800 × 600</div>'
            }}
          />
          <div className="spotlight-overlay"></div>
          
          {/* Navigation Arrows */}
          {spotlightMovies.length > 1 && (
            <>
              <button 
                className="spotlight-nav spotlight-nav-prev"
                onClick={handlePrevious}
                disabled={isTransitioning}
                aria-label="Poprzedni film"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                className="spotlight-nav spotlight-nav-next"
                onClick={handleNext}
                disabled={isTransitioning}
                aria-label="Następny film"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
        
        <div className={`spotlight-content ${isTransitioning ? 'transitioning' : ''}`}>
          <div className="spotlight-badge">
            🎬 Film {currentIndex + 1} z {spotlightMovies.length}
          </div>
          <h1 className="spotlight-title">{currentMovie.title}</h1>
          
          <div className="spotlight-meta">
            <div className="rating">
              <Star size={20} fill="#ffd700" color="#ffd700" />
              <span>{currentMovie.rating.toFixed(1)}</span>
            </div>
            <span className="genre">{currentMovie.genre.split(',')[0]}</span>
            <span className="runtime">{currentMovie.runtime}</span>
          </div>
          
          <p className="spotlight-description">
            {currentMovie.overview || "Odkryj ten niesamowity film, który zdobył serca widzów na całym świecie. Wspaniała historia, która na długo zostanie w Twojej pamięci."}
          </p>
          
          <div className="spotlight-stars">
            <strong>W rolach głównych:</strong> {currentMovie.stars.slice(0, 3).join(', ')}
          </div>
          
          {/* NOWA SEKCJA - Jeden guzik do szczegółów filmu */}
          <div className="spotlight-actions">
            <Link 
              to={`/movie/${currentMovie.id}`}
              className="btn-movie-details"
              style={{
                transform: settings.reduceMotion ? 'none' : undefined,
                transition: settings.reduceMotion ? 'none' : undefined
              }}
            >
              <Film size={18} />
              Przejdź do filmu
            </Link>
          </div>
        </div>
      </div>
      
      {/* Indicators/Dots */}
      {spotlightMovies.length > 1 && (
        <div className="spotlight-indicators">
          {spotlightMovies.map((_, index) => (
            <button
              key={index}
              className={`spotlight-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Przejdź do filmu ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Progress Bar */}
      {!settings.reduceMotion && spotlightMovies.length > 1 && (
        <div className="spotlight-progress">
          <div 
            className="spotlight-progress-bar"
            key={currentIndex}
            style={{ 
              animationDuration: '5s',
              animationDelay: '0s'
            }}
          />
        </div>
      )}
    </section>
  )
}

export default MovieSpotlight
