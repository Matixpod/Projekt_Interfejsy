import React, { useState } from 'react'
import { X, Star, Send, Clock, Calendar, User, Film, CreditCard, Smartphone, Building } from 'lucide-react'
import { useReviewsContext } from '../context/ReviewsContext'
import { useOrdersContext } from '../context/OrdersContext'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'

const MovieReviewModal = ({ isOpen, onClose, orderData }) => {
  const { addReview, hasUserReviewedOrder } = useReviewsContext()
  const { updateOrder } = useOrdersContext()
  const { settings } = useSettings()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    authorName: user?.username || '',
    rating: 50, // ZMIENIONO: domyślnie 50/100
    reviewText: '',
    paypalLink: '',
    blikNumber: '',
    bankTransferNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {}
    
    if (!user?.username) {
      newErrors.authorName = 'Musisz być zalogowany żeby napisać recenzję'
    }
    
    // ZMIENIONO: walidacja 1-100
    if (formData.rating < 1 || formData.rating > 100) {
      newErrors.rating = 'Ocena musi być między 1 a 100'
    }
    
    if (!formData.reviewText.trim()) {
      newErrors.reviewText = 'Treść recenzji jest wymagana'
    }
    
    if (formData.reviewText.length > 1000) {
      newErrors.reviewText = 'Recenzja nie może być dłuższa niż 1000 znaków'
    }

    const hasPaymentMethod = formData.paypalLink.trim() || 
                            formData.blikNumber.trim() || 
                            formData.bankTransferNumber.trim()
    
    if (!hasPaymentMethod) {
      newErrors.payment = 'Podaj co najmniej jedną metodę płatności'
    }

    if (formData.paypalLink.trim() && !isValidPayPalLink(formData.paypalLink)) {
      newErrors.paypalLink = 'Nieprawidłowy format linku PayPal'
    }

    if (formData.blikNumber.trim() && !isValidPhoneNumber(formData.blikNumber)) {
      newErrors.blikNumber = 'Nieprawidłowy numer telefonu (9 cyfr)'
    }

    if (formData.bankTransferNumber.trim() && !isValidBankAccount(formData.bankTransferNumber)) {
      newErrors.bankTransferNumber = 'Nieprawidłowy numer konta (26 cyfr)'
    }

    if (user?.username && hasUserReviewedOrder(orderData.id, user.username)) {
      newErrors.general = 'Już napisałeś recenzję dla tego zlecenia'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // DODANO: Funkcja do renderowania gwiazdek na podstawie ratingu 1-100
  const renderStars = (rating) => {
    const stars = []
    const maxStars = 5
    
    for (let i = 1; i <= maxStars; i++) {
      const starPercentage = Math.max(0, Math.min(100, (rating - (i - 1) * 20) * 5))
      const fillPercentage = Math.max(0, Math.min(100, starPercentage))
      
      stars.push(
        <div key={i} className="star-container">
          <Star size={20} color="#ddd" fill="none" />
          <div 
            className="star-fill"
            style={{ 
              width: `${fillPercentage}%`,
              background: 'linear-gradient(90deg, #ffd700, #ffed4e)'
            }}
          >
            <Star size={20} color="#ffd700" fill="#ffd700" />
          </div>
        </div>
      )
    }
    
    return stars
  }

  // DODANO: Funkcja do konwersji ratingu na opis
  const getRatingDescription = (rating) => {
    if (rating >= 90) return 'Doskonały'
    if (rating >= 80) return 'Bardzo dobry'
    if (rating >= 70) return 'Dobry'
    if (rating >= 60) return 'Średni'
    if (rating >= 50) return 'Słaby'
    if (rating >= 30) return 'Bardzo słaby'
    return 'Katastrofalny'
  }

  // ... pozostałe funkcje walidacji bez zmian ...
  const isValidPayPalLink = (link) => {
    const paypalRegex = /^(https?:\/\/)?(www\.)?(paypal\.me\/|paypal\.com\/)/i
    return paypalRegex.test(link) || link.includes('@')
  }

  const isValidPhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 9 && /^\d{9}$/.test(cleanPhone)
  }

  const isValidBankAccount = (account) => {
    const cleanAccount = account.replace(/\s/g, '')
    return cleanAccount.length === 26 && /^\d{26}$/.test(cleanAccount)
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
        authorName: user.username,
        rating: formData.rating, // Już w skali 1-100
        reviewText: formData.reviewText.trim(),
        avatar: user.avatar || getRandomAvatar(),
        paymentMethods: {
          paypal: formData.paypalLink.trim() || null,
          blik: formData.blikNumber.trim() || null,
          bankTransfer: formData.bankTransferNumber.trim() || null
        }
      }
      
      addReview(reviewData)
      
      const newCurrentReviewers = (orderData.currentReviewers || 0) + 1
      updateOrder(orderData.id, {
        currentReviewers: newCurrentReviewers
      })
      
      setFormData({
        authorName: user.username,
        rating: 50,
        reviewText: '',
        paypalLink: '',
        blikNumber: '',
        bankTransferNumber: ''
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: null, payment: null }))
  }

  const handleBlikChange = (value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 9)
    const formattedValue = cleanValue.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3').trim()
    handleInputChange('blikNumber', formattedValue)
  }

  const handleBankAccountChange = (value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 26)
    const formattedValue = cleanValue.replace(/(\d{2})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4 $5 $6 $7').trim()
    handleInputChange('bankTransferNumber', formattedValue)
  }

  return (
    <>
      <div className="movie-modal-overlay" onClick={onClose} />
      <div className="movie-review-modal">
        <button 
          className="movie-modal-close"
          onClick={onClose}
          aria-label="Zamknij"
        >
          <X size={24} />
        </button>

        <div className="movie-modal-container">
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

          <div className="movie-modal-details">
            <div className="movie-modal-header">
              <h1 className="movie-modal-title">{orderData.movieTitle}</h1>
              <p className="movie-modal-subtitle">Zlecenie recenzji</p>
            </div>

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

            <div className="movie-modal-description">
              <h3>Opis zlecenia</h3>
              <p>{orderData.description}</p>
            </div>

            <div className="movie-modal-review-form">
              <h3>📝 Napisz swoją recenzję</h3>
              
              {errors.general && (
                <div className="auth-error" style={{ marginBottom: '20px' }}>
                  {errors.general}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Autor recenzji */}
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

                {/* ZMIENIONO: Rating 1-100 z sliderem */}
                <div className="form-group-full">
                  <label htmlFor="rating">Twoja ocena</label>
                  <div className="rating-input-100">
                    <div className="rating-slider-container">
                      <input
                        type="range"
                        id="rating"
                        min="1"
                        max="100"
                        value={formData.rating}
                        onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                        className="rating-slider"
                      />
                      <div className="rating-labels">
                        <span>1</span>
                        <span>25</span>
                        <span>50</span>
                        <span>75</span>
                        <span>100</span>
                      </div>
                    </div>
                    <div className="rating-display">
                      <div className="rating-stars">
                        {renderStars(formData.rating)}
                      </div>
                      <div className="rating-info">
                        <span className="rating-number">{formData.rating}/100</span>
                        <span className="rating-description">{getRatingDescription(formData.rating)}</span>
                      </div>
                    </div>
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

                {/* Sekcja płatności - bez zmian */}
                <div className="payment-section">
                  <h4>💰 Dane do wypłaty ({orderData.price} PLN)</h4>
                  <p className="payment-hint">Podaj co najmniej jedną metodę płatności do otrzymania wynagrodzenia</p>
                  
                  {errors.payment && (
                    <div className="payment-error">{errors.payment}</div>
                  )}

                  {/* PayPal */}
                  <div className="form-group-inline">
                    <label htmlFor="paypalLink">
                      <CreditCard size={16} />
                      PayPal
                    </label>
                    <input
                      id="paypalLink"
                      type="text"
                      value={formData.paypalLink}
                      onChange={(e) => handleInputChange('paypalLink', e.target.value)}
                      placeholder="paypal.me/username lub email@paypal.com"
                      className={errors.paypalLink ? 'error' : ''}
                    />
                    {errors.paypalLink && <span className="error-text">{errors.paypalLink}</span>}
                  </div>

                  {/* BLIK */}
                  <div className="form-group-inline">
                    <label htmlFor="blikNumber">
                      <Smartphone size={16} />
                      BLIK (numer telefonu)
                    </label>
                    <input
                      id="blikNumber"
                      type="text"
                      value={formData.blikNumber}
                      onChange={(e) => handleBlikChange(e.target.value)}
                      placeholder="123 456 789"
                      className={errors.blikNumber ? 'error' : ''}
                      maxLength={11}
                    />
                    {errors.blikNumber && <span className="error-text">{errors.blikNumber}</span>}
                  </div>

                  {/* Przelew bankowy */}
                  <div className="form-group-inline">
                    <label htmlFor="bankTransferNumber">
                      <Building size={16} />
                      Numer konta bankowego
                    </label>
                    <input
                      id="bankTransferNumber"
                      type="text"
                      value={formData.bankTransferNumber}
                      onChange={(e) => handleBankAccountChange(e.target.value)}
                      placeholder="12 3456 7890 1234 5678 9012 3456"
                      className={errors.bankTransferNumber ? 'error' : ''}
                      maxLength={35}
                    />
                    {errors.bankTransferNumber && <span className="error-text">{errors.bankTransferNumber}</span>}
                  </div>
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
                    disabled={isSubmitting || !user}
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
