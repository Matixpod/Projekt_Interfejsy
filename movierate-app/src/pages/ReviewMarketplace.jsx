import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Users, User, Film, Tv, Edit3, Eye } from 'lucide-react'
import { useOrdersContext } from '../context/OrdersContext'
import { useReviewsContext } from '../context/ReviewsContext'
import MovieReviewModal from '../components/ReviewModel'
import OrderDetailsModal from '../components/OrderDetailsModal' // DODANO

const ReviewMarketplace = () => {
  const { orders } = useOrdersContext() // USUNIĘTO applyToOrder
  const { hasUserReviewedOrder } = useReviewsContext()
  
  // Stan dla modali
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false) // DODANO
  
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

  // USUNIĘTO handleApply - nie potrzebujemy już aplikowania

  // Funkcje obsługi modala recenzji
  const openReviewModal = (order) => {
    setSelectedOrder(order)
    setIsReviewModalOpen(true)
  }

  const closeReviewModal = () => {
    setSelectedOrder(null)
    setIsReviewModalOpen(false)
  }

  // DODANO: Funkcje obsługi modala szczegółów
  const openDetailsModal = (order) => {
    setSelectedOrder(order)
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setSelectedOrder(null)
    setIsDetailsModalOpen(false)
  }

  // Sortuj zamówienia od najnowszych
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

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

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Brak aktywnych zleceń</p>
          <Link to="/order-review" className="btn-create-order">
            Dodaj pierwsze zlecenie
          </Link>
        </div>
      ) : (
        <>
          <div className="marketplace-stats">
            <div className="stat-card">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Aktywne zlecenia</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {orders.reduce((sum, order) => sum + order.price, 0)} PLN
              </span>
              <span className="stat-label">Łączna wartość</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {orders.filter(o => o.currentReviewers < o.maxReviewers).length}
              </span>
              <span className="stat-label">Dostępne miejsca</span>
            </div>
          </div>

          <div className="marketplace-grid">
            {sortedOrders.map(order => {
              const daysLeft = calculateDaysLeft(order.deadline)
              const spotsStatus = getSpotsLeftColor(order.currentReviewers, order.maxReviewers)
              
              return (
                <div key={order.id} className="marketplace-card">
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
                          {order.currentReviewers}/{order.maxReviewers} miejsc zajętych
                        </span>
                      </div>
                    </div>
                    
                    <p className="marketplace-card-description">
                      {order.description && order.description.length > 100 
                        ? `${order.description.substring(0, 100)}...` 
                        : order.description || 'Brak opisu'
                      }
                    </p>
                    
                    {/* ZAKTUALIZOWANA SEKCJA PRZYCISKÓW - USUNIĘTO APLIKUJ */}
                    <div className="marketplace-card-actions">
                      <button 
                        className="btn-details"
                        onClick={() => openDetailsModal(order)} // ZMIENIONO
                        title="Zobacz pełne szczegóły zlecenia"
                      >
                        <Eye size={14} />
                        Szczegóły
                      </button>
                      
                      <button 
                        className="btn-review"
                        onClick={() => openReviewModal(order)}
                        title="Napisz recenzję dla tego filmu"
                      >
                        <Edit3 size={14} />
                        Napisz recenzję
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* MODAL DO PISANIA RECENZJI */}
      {isReviewModalOpen && selectedOrder && (
        <MovieReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          orderData={selectedOrder}
        />
      )}

      {/* DODANO: MODAL SZCZEGÓŁÓW ZLECENIA */}
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
