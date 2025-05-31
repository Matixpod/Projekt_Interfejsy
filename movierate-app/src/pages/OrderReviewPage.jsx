import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Film, User, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { useOrdersContext } from '../context/OrdersContext'
import { useAuth } from '../context/AuthContext' // DODANO

const OrderReviewPage = () => {
  const navigate = useNavigate()
  const { addOrder } = useOrdersContext()
  const { user } = useAuth() // DODANO

  const [formData, setFormData] = useState({
    movieTitle: '',
    movieType: 'movie',
    movieImage: '',
    reviewPrice: '',
    deadline: '',
    description: '',
    requirements: '',
    maxReviewers: '1',
    authorName: user?.username || '', // DODANO: Auto-fill z user context
    authorEmail: '' // USUNIĘTO: paymentMethod
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.movieTitle.trim()) {
      newErrors.movieTitle = 'Tytuł filmu/serialu jest wymagany'
    }
    if (!formData.reviewPrice || parseFloat(formData.reviewPrice) <= 0) {
      newErrors.reviewPrice = 'Podaj prawidłową cenę'
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Data końcowa jest wymagana'
    } else if (new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Data musi być w przyszłości'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Opis zlecenia jest wymagany'
    }
    if (!formData.authorName.trim()) {
      newErrors.authorName = 'Nazwa użytkownika jest wymagana'
    }
    if (!formData.authorEmail.trim()) {
      newErrors.authorEmail = 'Email jest wymagany'
    } else if (!/\S+@\S+\.\S+/.test(formData.authorEmail)) {
      newErrors.authorEmail = 'Podaj prawidłowy email'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setIsSubmitting(true)
    
    const newOrder = {
      ...formData,
      price: parseFloat(formData.reviewPrice),
      maxReviewers: formData.maxReviewers === 'unlimited' ? 999 : parseInt(formData.maxReviewers),
      movieImage: formData.movieImage || `https://via.placeholder.com/250x350/d0d0d0/666?text=${encodeURIComponent(formData.movieTitle)}`
      // USUNIĘTO: paymentMethod - recenzenci będą podawać swoje dane płatności
    }
    
    addOrder(newOrder)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
      setTimeout(() => {
        navigate('/review-marketplace')
      }, 2000)
    }, 1000)
  }

  return (
    <div className="order-review-page">
      <div className="order-review-container">
        <h1 className="order-review-title">Zlecenie recenzji</h1>
        <p className="order-review-subtitle">
          Wypełnij formularz, aby zlecić napisanie recenzji filmu lub serialu
        </p>
        
        {showSuccess && (
          <div className="success-message">
            <AlertCircle size={20} />
            Twoje zlecenie zostało dodane pomyślnie! Oczekuj na zgłoszenia recenzentów.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="order-form">
          {/* Sekcja informacji o filmie */}
          <div className="form-section">
            <h2 className="form-section-title">
              <Film size={20} />
              Informacje o filmie/serialu
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="movieTitle">Tytuł filmu/serialu *</label>
                <input
                  type="text"
                  id="movieTitle"
                  name="movieTitle"
                  value={formData.movieTitle}
                  onChange={handleChange}
                  placeholder="np. Oppenheimer"
                  className={errors.movieTitle ? 'error' : ''}
                />
                {errors.movieTitle && <span className="error-text">{errors.movieTitle}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="movieType">Typ</label>
                <select
                  id="movieType"
                  name="movieType"
                  value={formData.movieType}
                  onChange={handleChange}
                >
                  <option value="movie">Film</option>
                  <option value="tvshow">Serial</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="movieImage">
                Link do plakatu (opcjonalnie)
                <ImageIcon size={16} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
              </label>
              <input
                type="url"
                id="movieImage"
                name="movieImage"
                value={formData.movieImage}
                onChange={handleChange}
                placeholder="https://example.com/poster.jpg"
              />
              {formData.movieImage && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={formData.movieImage}
                    alt="Podgląd plakatu"
                    style={{ maxWidth: 120, maxHeight: 180, borderRadius: 4, border: '1px solid #ccc' }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Opis zlecenia *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Opisz czego oczekujesz od recenzji, np. długość, styl, na co zwrócić uwagę..."
                rows="4"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="requirements">Dodatkowe wymagania</label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="np. minimalna liczba słów, format recenzji, platforma publikacji..."
                rows="3"
              />
            </div>
          </div>

          {/* Sekcja szczegółów zamówienia */}
          <div className="form-section">
            <h2 className="form-section-title">
              <DollarSign size={20} />
              Szczegóły zamówienia
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reviewPrice">Cena za recenzję (PLN) *</label>
                <input
                  type="number"
                  id="reviewPrice"
                  name="reviewPrice"
                  value={formData.reviewPrice}
                  onChange={handleChange}
                  placeholder="np. 50"
                  min="1"
                  className={errors.reviewPrice ? 'error' : ''}
                />
                {errors.reviewPrice && <span className="error-text">{errors.reviewPrice}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="deadline">Termin wykonania *</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={errors.deadline ? 'error' : ''}
                />
                {errors.deadline && <span className="error-text">{errors.deadline}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="maxReviewers">Maks. liczba recenzentów</label>
              <select
                id="maxReviewers"
                name="maxReviewers"
                value={formData.maxReviewers}
                onChange={handleChange}
              >
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="unlimited">Bez limitu</option>
              </select>
            </div>
          </div>

          {/* Sekcja danych zleceniodawcy */}
          <div className="form-section">
            <h2 className="form-section-title">
              <User size={20} />
              Dane zleceniodawcy
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="authorName">Nazwa użytkownika *</label>
                <input
                  type="text"
                  id="authorName"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  className={errors.authorName ? 'error' : ''}
                  readOnly={!!user} // Readonly jeśli zalogowany
                  style={{
                    backgroundColor: user ? '#f8f9fa' : 'white',
                    cursor: user ? 'not-allowed' : 'text'
                  }}
                />
                {errors.authorName && <span className="error-text">{errors.authorName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="authorEmail">Email *</label>
                <input
                  type="email"
                  id="authorEmail"
                  name="authorEmail"
                  value={formData.authorEmail}
                  onChange={handleChange}
                  className={errors.authorEmail ? 'error' : ''}
                  placeholder="kontakt@email.com"
                />
                {errors.authorEmail && <span className="error-text">{errors.authorEmail}</span>}
              </div>
            </div>
            
            {/* DODANO: Informacja o płatnościach */}
            <div className="payment-info-box">
              <h4>💰 Informacja o płatnościach</h4>
              <p>
                Recenzenci będą podawać swoje dane płatności (PayPal, BLIK, przelew) 
                podczas pisania recenzji. Wypłata nastąpi po zaakceptowaniu recenzji.
              </p>
            </div>
            
            {/* USUNIĘTO: Pole wyboru metody płatności */}
          </div>

          <button
            type="submit"
            className="btn-send-order"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wysyłanie...' : 'Złóż zlecenie'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OrderReviewPage
