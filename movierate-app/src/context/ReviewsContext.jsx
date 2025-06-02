import React, { createContext, useContext } from 'react'
import useReviews from '../hooks/UseReviews'
import { useOrdersContext } from './OrdersContext' // 

const ReviewsContext = createContext()

export const useReviewsContext = () => {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error('useReviewsContext must be used within ReviewsProvider')
  }
  return context
}

export const ReviewsProvider = ({ children }) => {
  const { updateOrder } = useOrdersContext() // 
  const reviewsData = useReviews()

  // : Wrapper dla addReview z automatyczną aktualizacją zlecenia
  const addReviewWithOrderUpdate = (newReview) => {
    const updateOrderCallback = (orderId) => {
      // Znajdź zlecenie i zwiększ currentReviewers
      updateOrder(orderId, (prevOrder) => ({
        ...prevOrder,
        currentReviewers: (prevOrder.currentReviewers || 0) + 1
      }))
    }
    
    return reviewsData.addReview(newReview, updateOrderCallback)
  }

  // : Rozszerzone API z nową funkcją
  const extendedReviewsData = {
    ...reviewsData,
    addReview: addReviewWithOrderUpdate // Zastąp oryginalną funkcję
  }

  return (
    <ReviewsContext.Provider value={extendedReviewsData}>
      {children}
    </ReviewsContext.Provider>
  )
}
