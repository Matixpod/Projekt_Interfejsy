import React, { useState } from 'react'
import { X, Star, Send, Clock, Calendar, User, Film } from 'lucide-react'
import { useReviewsContext } from '../context/ReviewsContext'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext' // DODANO

const MovieReviewModal = ({ isOpen, onClose, orderData }) => {
  const { addReview, hasUserReviewedOrder } = useReviewsContext()
  const { settings } = useSettings()
  const { user } = useAuth() // DODANO
  
  const [formData, setFormData] = useState({
    authorName: user?.username || '', // AUTOMATYCZNE WYPEŁNIENIE
    rating: 0,
    reviewText: '',
    hoveredRating: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {}
    
    // UPROSZCZONA WALIDACJA - username zawsze z user context
    if (!user?.username) {
      newErrors.authorName = 'Musisz być zalogowany żeby napisać recenzję'
    }
    
    if (formData.rating === 0) {
      newErrors.rating = 'Ocena jest wymagana'
    }
    
    if (!formData.reviewText.trim()) {
      newErrors.reviewText = 'Treść recenzji jest wymagana'
    }
    
    if (formData.reviewText.length > 1000) {
      newErrors.reviewText = 'Recenzja nie może być dłuższa niż 1000 znaków'
    }

    // SPRAWDŹ CZY UŻYTKOWNIK JUŻ NIE NAPISAŁ RECENZJI
    if (user?.username && hasUserReviewedOrder(orderData.id, user.username)) {
      newErrors.general = 'Już napisałeś recenzję dla tego zlecenia'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const reviewData = {
        orderId: orderData.id,
        movieTitle: orderData.movieTitle,
        movieImage: orderData.movieImage,
        authorName: user.username, // ZAWSZE Z USER CONTEXT
        rating: formData.rating,
        reviewText: formData.reviewText.trim(),
        avatar: user.avatar || getRandomAvatar() // UŻYJ AVATAR UŻYTKOWNIKA
      }
      
      addReview(reviewData)
      
      // RESET TYLKO RATING I TEXT (NIE USERNAME)
      setFormData({
        authorName: user.username,
        rating: 0,
        reviewText: '',
        hoveredRating: 0
      })
      
      alert('Recenzja została dodana pomyślnie!')
      onClose()
      
    } catch (error) {
      console.error('Error adding review:', error)
      alert('Wystąpił błąd przy dodawaniu recenzji')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRandomAvatar = () => {
    const avatars = ['👤', '🎭', '🎬', '🍿', '⭐', '🎪', '🎨', '🎯', '🎲', '🎮']
    return avatars[Math.floor(Math.random() * avatars.length)]
  }

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
    setErrors(prev => ({ ...prev, rating: null }))
  }

  const handleRatingHover = (rating) => {
    setFormData(prev => ({ ...prev, hoveredRating: rating }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: null }))
  }

  return (
    <>
      <div className="movie-modal-overlay" onClick={onClose} />
      <div className="movie-review-modal">
        {/* Header z przyciskiem zamknij */}
        <button 
          className="movie-modal-close"
          onClick={onClose}
          aria-label="Zamknij"
        >
          <X size={24} />
        </button>

        <div className="movie-modal-container">
          {/* Lewa strona - Poster i podstawowe info */}
          <div className="movie-modal-poster">
            <img 
              src={orderData.movieImage} 
              alt={orderData.movieTitle}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x600/d0d0d0/666?text=No+Image'
              }}
            />
            
            <div className="movie-modal-badges">
              <div className="modal-badge">
                {orderData.movieType === 'movie' ? <Film size={16} /> : <Film size={16} />}
                {orderData.movieType === 'movie' ? 'Film' : 'Serial'}
              </div>
              <div className="modal-badge price-badge">
                {orderData.price} PLN
              </div>
            </div>
          </div>

          {/* Prawa strona - Szczegóły i formularz */}
          <div className="movie-modal-details">
            <div className="movie-modal-header">
              <h1 className="movie-modal-title">{orderData.movieTitle}</h1>
              <p className="movie-modal-subtitle">Zlecenie recenzji</p>
            </div>

            {/* Informacje o zleceniu */}
            <div className="movie-modal-info">
              <div className="info-item">
                <User size={16} />
                <span>Zleceniodawca: <strong>{orderData.authorName}</strong></span>
              </div>
              <div className="info-item">
                <Calendar size={16} />
                <span>Termin: <strong>{new Date(orderData.deadline).toLocaleDateString()}</strong></span>
              </div>
              <div className="info-item">
                <Clock size={16} />
                <span>Typ: <strong>{orderData.movieType === 'movie' ? 'Film' : 'Serial'}</strong></span>
              </div>
            </div>

            {/* Opis zlecenia */}
            <div className="movie-modal-description">
              <h3>Opis zlecenia</h3>
              <p>{orderData.description}</p>
            </div>

            {/* Formularz recenzji */}
            <div className="movie-modal-review-form">
              <h3>📝 Napisz swoją recenzję</h3>
              
              {/* POKAZUJ BŁĄD OGÓLNY */}
              {errors.general && (
                <div className="auth-error" style={{ marginBottom: '20px' }}>
                  {errors.general}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Nazwa użytkownika - TYLKO DO ODCZYTU */}
                <div className="form-group-inline">
                  <label htmlFor="authorName">Autor recenzji</label>
                  <div className="logged-user-info">
                    <span className="user-avatar-small">{user?.avatar}</span>
                    <input
                      id="authorName"
                      type="text"
                      value={user?.username || 'Nie zalogowany'}
                      readOnly
                      className="readonly-input"
                      title="Nazwa użytkownika z Twojego konta"
                    />
                  </div>
                  {errors.authorName && <span className="error-text">{errors.authorName}</span>}
                </div>

                {/* Rating */}
                <div className="form-group-inline">
                  <label>Twoja ocena</label>
                  <div className="rating-input-horizontal">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        className="rating-star"
                        onClick={() => handleRatingClick(rating)}
                        onMouseEnter={() => handleRatingHover(rating)}
                        onMouseLeave={() => handleRatingHover(0)}
                        style={{
                          transition: settings.reduceMotion ? 'none' : undefined
                        }}
                      >
                        <Star
                          size={24}
                          fill={rating <= (formData.hoveredRating || formData.rating) ? "#ffd700" : "none"}
                          color={rating <= (formData.hoveredRating || formData.rating) ? "#ffd700" : "#ddd"}
                        />
                      </button>
                    ))}
                    <span className="rating-label">
                      {formData.rating > 0 ? `${formData.rating}/5` : 'Wybierz ocenę'}
                    </span>
                  </div>
                  {errors.rating && <span className="error-text">{errors.rating}</span>}
                </div>

                {/* Treść recenzji */}
                <div className="form-group-full">
                  <label htmlFor="reviewText">Twoja recenzja</label>
                  <textarea
                    id="reviewText"
                    value={formData.reviewText}
                    onChange={(e) => handleInputChange('reviewText', e.target.value)}
                    placeholder="Podziel się swoją opinią o tym filmie..."
                    className={errors.reviewText ? 'error' : ''}
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="char-count">
                    {formData.reviewText.length}/1000 znaków
                  </div>
                  {errors.reviewText && <span className="error-text">{errors.reviewText}</span>}
                </div>

                {/* Przyciski */}
                <div className="movie-modal-actions">
                  <button 
                    type="button" 
                    className="btn-modal-cancel"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Anuluj
                  </button>
                  <button 
                    type="submit" 
                    className="btn-modal-submit"
                    disabled={isSubmitting || !user} // WYŁĄCZ JEŚLI BRAK USERA
                  >
                    {isSubmitting ? (
                      'Publikowanie...'
                    ) : (
                      <>
                        <Send size={16} />
                        Opublikuj recenzję
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MovieReviewModal

