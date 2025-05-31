import React from 'react'
import { X, Calendar, DollarSign, Users, User, Film, Tv, Clock, Star } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

const OrderDetailsModal = ({ isOpen, onClose, orderData }) => {
  const { settings } = useSettings()

  if (!isOpen || !orderData) return null

  const calculateDaysLeft = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getSpotsLeftColor = (current, max) => {
    const percentage = (current / max) * 100
    if (percentage >= 100) return 'full'
    if (percentage >= 75) return 'almost-full'
    return 'available'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCreatedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const daysLeft = calculateDaysLeft(orderData.deadline)
  const spotsStatus = getSpotsLeftColor(orderData.currentReviewers, orderData.maxReviewers)

  return (
    <>
      <div className="order-modal-overlay" onClick={onClose} />
      <div className="order-details-modal">
        {/* Header z przyciskiem zamknij */}
        <button 
          className="order-modal-close"
          onClick={onClose}
          aria-label="Zamknij"
        >
          <X size={24} />
        </button>

        <div className="order-modal-container">
          {/* Lewa strona - Poster i status */}
          <div className="order-modal-poster">
            <img 
              src={orderData.movieImage} 
              alt={orderData.movieTitle}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x600/d0d0d0/666?text=No+Image'
              }}
            />
            
            <div className="order-modal-badges">
              <div className="order-badge">
                {orderData.movieType === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                {orderData.movieType === 'movie' ? 'Film' : 'Serial'}
              </div>
              <div className="order-badge price-badge">
                <DollarSign size={16} />
                {orderData.price} PLN
              </div>
              <div className={`order-badge spots-badge spots-${spotsStatus}`}>
                <Users size={16} />
                {orderData.currentReviewers}/{orderData.maxReviewers} miejsc
              </div>
              <div className={`order-badge deadline-badge ${daysLeft < 3 ? 'urgent' : ''}`}>
                <Clock size={16} />
                {daysLeft > 0 ? `${daysLeft} dni` : 'Ostatni dzień'}
              </div>
            </div>
          </div>

          {/* Prawa strona - Szczegóły zlecenia */}
          <div className="order-modal-details">
            <div className="order-modal-header">
              <h1 className="order-modal-title">{orderData.movieTitle}</h1>
              <p className="order-modal-subtitle">Zlecenie recenzji</p>
            </div>

            {/* Podstawowe informacje */}
            <div className="order-modal-info">
              <div className="info-section">
                <h3>Informacje o zleceniu</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <User size={16} />
                    <div>
                      <span className="info-label">Zleceniodawca</span>
                      <span className="info-value">{orderData.authorName}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <Calendar size={16} />
                    <div>
                      <span className="info-label">Termin realizacji</span>
                      <span className="info-value">{formatDate(orderData.deadline)}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <DollarSign size={16} />
                    <div>
                      <span className="info-label">Wynagrodzenie</span>
                      <span className="info-value">{orderData.price} PLN</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <Users size={16} />
                    <div>
                      <span className="info-label">Potrzebni recenzenci</span>
                      <span className="info-value">
                        {orderData.currentReviewers} z {orderData.maxReviewers}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Opis zlecenia */}
            <div className="order-modal-description">
              <h3>Opis zlecenia</h3>
              <div className="description-content">
                <p>{orderData.description}</p>
              </div>
            </div>

            {/* Status zlecenia */}
            <div className="order-modal-status">
              <h3>Status zlecenia</h3>
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-indicator">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="status-label">Pozostały czas</span>
                    <span className={`status-value ${daysLeft < 3 ? 'urgent' : ''}`}>
                      {daysLeft > 0 ? `${daysLeft} dni` : 'Ostatni dzień'}
                    </span>
                  </div>
                </div>

                <div className="status-item">
                  <div className="status-indicator">
                    <Users size={20} />
                  </div>
                  <div>
                    <span className="status-label">Dostępność</span>
                    <span className={`status-value spots-${spotsStatus}`}>
                      {orderData.currentReviewers >= orderData.maxReviewers 
                        ? 'Brak miejsc' 
                        : `${orderData.maxReviewers - orderData.currentReviewers} wolnych miejsc`
                      }
                    </span>
                  </div>
                </div>

                <div className="status-item">
                  <div className="status-indicator">
                    <Star size={20} />
                  </div>
                  <div>
                    <span className="status-label">Utworzono</span>
                    <span className="status-value">
                      {formatCreatedDate(orderData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wymagania (jeśli są) */}
            <div className="order-modal-requirements">
              <h3>Wymagania</h3>
              <div className="requirements-list">
                <div className="requirement-item">
                  ✅ Recenzja minimum 100 słów
                </div>
                <div className="requirement-item">
                  ✅ Ocena w skali 1-5 gwiazdek
                </div>
                <div className="requirement-item">
                  ✅ Szczera i obiektywna opinia
                </div>
                <div className="requirement-item">
                  ✅ Terminowa realizacja
                </div>
              </div>
            </div>

            {/* Przyciski akcji */}
            <div className="order-modal-actions">
              <button 
                className="btn-modal-close"
                onClick={onClose}
                style={{
                  transition: settings.reduceMotion ? 'none' : undefined
                }}
              >
                Zamknij
              </button>
              <button 
                className="btn-modal-contact"
                onClick={() => alert(`Skontaktuj się z ${orderData.authorName}`)}
                style={{
                  transition: settings.reduceMotion ? 'none' : undefined
                }}
              >
                <User size={16} />
                Kontakt
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderDetailsModal
