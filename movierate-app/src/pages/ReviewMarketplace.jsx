import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Users, User, Film, Tv, Edit3, Eye } from 'lucide-react'
import { useOrdersContext } from '../context/OrdersContext'
import { useReviewsContext } from '../context/ReviewsContext'
import MovieReviewModal from '../components/MovieReviewModal'
import OrderDetailsModal from '../components/OrderDetailsModal'

const ReviewMarketplace = () => {
  const { orders, getAvailableOrders } = useOrdersContext() // DODANO getAvailableOrders
  const { hasUserReviewedOrder } = useReviewsContext()
  
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true) // DODANO filter toggle
  
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

  const openReviewModal = (order) => {
    setSelectedOrder(order)
    setIsReviewModalOpen(true)
  }

  const closeReviewModal = () => {
    setSelectedOrder(null)
    setIsReviewModalOpen(false)
  }

  const openDetailsModal = (order) => {
    setSelectedOrder(order)
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setSelectedOrder(null)
    setIsDetailsModalOpen(false)
  }

  // DODANO: Memoized filtered orders
  const filteredOrders = useMemo(() => {
    let ordersToShow = [...orders]
    
    if (showOnlyAvailable) {
      // Pokazuj tylko zlecenia z dostępnymi miejscami
      ordersToShow = ordersToShow.filter(order => 
        (order.currentReviewers || 0) < (order.maxReviewers || 1)
      )
    }
    
    // Sortuj od najnowszych
    return ordersToShow.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  }, [orders, showOnlyAvailable])

  // DODANO: Statistics
  const stats = useMemo(() => {
    const availableOrders = getAvailableOrders()
    const totalValue = orders.reduce((sum, order) => sum + order.price, 0)
    const availableValue = availableOrders.reduce((sum, order) => sum + order.price, 0)
    
    return {
      total: orders.length,
      available: availableOrders.length,
      totalValue,
      availableValue
    }
  }, [orders, getAvailableOrders])

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <div>
          <h1 className="marketplace-title">Rynek zleceń recenzji</h1>
          <p className="marketplace-subtitle">
            Przeglądaj dostępne zlecenia i zarabiaj pisząc recenzje
          </p>
        </div>
        <Link to="/order-review" className="btn-create-order">
          <DollarSign size={20} />
          Dodaj zlecenie
        </Link>
      </div>

      {/* DODANO: Filter Toggle */}
      <div className="marketplace-filters">
        <div className="filter-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span>Pokazuj tylko dostępne zlecenia</span>
        </div>
        <div className="results-summary">
          Wyświetlanie {filteredOrders.length} z {orders.length} zleceń
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Brak aktywnych zleceń</p>
          <Link to="/order-review" className="btn-create-order">
            Dodaj pierwsze zlecenie
          </Link>
        </div>
      ) : (
        <>
          {/* ZAKTUALIZOWANE: Statistics */}
          <div className="marketplace-stats">
            <div className="stat-card">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Wszystkie zlecenia</span>
            </div>

            <div className="stat-card">
              <span className="stat-number">{stats.totalValue} PLN</span>
              <span className="stat-label">Łączna wartość</span>
            </div>

          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-results-state">
              <h3>Brak zleceń spełniających kryteria</h3>
              <p>
                {showOnlyAvailable 
                  ? 'Wszystkie zlecenia mają zapełnione miejsca. Spróbuj później!'
                  : 'Brak zleceń do wyświetlenia.'
                }
              </p>
              <button 
                className="btn-show-all"
                onClick={() => setShowOnlyAvailable(false)}
              >
                Pokaż wszystkie zlecenia
              </button>
            </div>
          ) : (
            <div className="marketplace-grid">
              {filteredOrders.map(order => {
                const daysLeft = calculateDaysLeft(order.deadline)
                const spotsStatus = getSpotsLeftColor(order.currentReviewers, order.maxReviewers)
                const isOrderFull = (order.currentReviewers || 0) >= (order.maxReviewers || 1)
                
                return (
                  <div 
                    key={order.id} 
                    className={`marketplace-card ${isOrderFull ? 'order-full' : ''}`}
                  >
                    <div className="marketplace-card-image">
                      <img 
                        src={order.movieImage} 
                        alt={order.movieTitle}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/250x350/d0d0d0/666?text=No+Image'
                        }}
                      />
                      <div className="marketplace-card-type">
                        {order.movieType === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                        {order.movieType === 'movie' ? 'Film' : 'Serial'}
                      </div>
                      <div className="marketplace-card-price">
                        {order.price} PLN
                      </div>
                      {/* DODANO: Status overlay dla pełnych zleceń */}
                      {isOrderFull && (
                        <div className="order-full-overlay">
                          <span>Zapełnione</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="marketplace-card-info">
                      <h3 className="marketplace-card-title">{order.movieTitle}</h3>
                      
                      <div className="marketplace-card-details">
                        <div className="detail-row">
                          <User size={14} />
                          <span>{order.authorName}</span>
                        </div>
                        
                        <div className="detail-row">
                          <Calendar size={14} />
                          <span className={daysLeft < 3 ? 'urgent' : ''}>
                            {daysLeft > 0 ? `${daysLeft} dni` : 'Dziś'} do końca
                          </span>
                        </div>
                        
                        <div className="detail-row">
                          <Users size={14} />
                          <span className={`spots-${spotsStatus}`}>
                            {order.currentReviewers || 0}/{order.maxReviewers} miejsc zajętych
                          </span>
                        </div>
                      </div>
                      
                      <p className="marketplace-card-description">
                        {order.description && order.description.length > 100 
                          ? `${order.description.substring(0, 100)}...` 
                          : order.description || 'Brak opisu'
                        }
                      </p>
                      
                      <div className="marketplace-card-actions">
                        <button 
                          className="btn-details"
                          onClick={() => openDetailsModal(order)}
                          title="Zobacz pełne szczegóły zlecenia"
                        >
                          <Eye size={14} />
                          Szczegóły
                        </button>
                        
                        <button 
                          className="btn-review"
                          onClick={() => openReviewModal(order)}
                          title="Napisz recenzję dla tego filmu"
                          disabled={isOrderFull} // DODANO: Disable dla pełnych zleceń
                        >
                          <Edit3 size={14} />
                          {isOrderFull ? 'Brak miejsc' : 'Napisz recenzję'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {isReviewModalOpen && selectedOrder && (
        <MovieReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          orderData={selectedOrder}
        />
      )}

      {isDetailsModalOpen && selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          orderData={selectedOrder}
        />
      )}
    </div>
  )
}

export default ReviewMarketplace
