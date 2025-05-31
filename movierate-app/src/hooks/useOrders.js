import { useState, useEffect } from 'react'

const useOrders = () => {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('movierate-orders')
    return savedOrders ? JSON.parse(savedOrders) : []
  })

  useEffect(() => {
    localStorage.setItem('movierate-orders', JSON.stringify(orders))
  }, [orders])

  const addOrder = (newOrder) => {
    const order = {
      ...newOrder,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      currentReviewers: 0
    }
    setOrders(prev => [...prev, order])
    return order
  }

  // ZAKTUALIZOWANO: updateOrder obsługuje teraz funkcje callback
  const updateOrder = (orderId, updates) => {
    setOrders(prev => 
      prev.map(order => {
        if (order.id === orderId) {
          // Jeśli updates jest funkcją, wywołaj ją z obecnym stanem
          if (typeof updates === 'function') {
            return updates(order)
          }
          // Jeśli updates to obiekt, merge jak wcześniej
          return { ...order, ...updates }
        }
        return order
      })
    )
  }

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId))
  }

  // USUNIĘTO: applyToOrder - nie potrzebujemy już tej funkcji

  // DODANO: Funkcja do filtrowania dostępnych zleceń
  const getAvailableOrders = () => {
    return orders.filter(order => 
      (order.currentReviewers || 0) < (order.maxReviewers || 1)
    )
  }

  // DODANO: Funkcja do sprawdzania czy zlecenie ma dostępne miejsca
  const hasAvailableSlots = (orderId) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return false
    return (order.currentReviewers || 0) < (order.maxReviewers || 1)
  }

  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    getAvailableOrders, // DODANO
    hasAvailableSlots   // DODANO
  }
}

export default useOrders
