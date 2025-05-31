import React, { createContext, useContext } from 'react'
import useReviews from '../hooks/UseReviews'

const ReviewsContext = createContext()

export const useReviewsContext = () => {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error('useReviewsContext must be used within ReviewsProvider')
  }
  return context
}

export const ReviewsProvider = ({ children }) => {
  const reviewsData = useReviews()

  return (
    <ReviewsContext.Provider value={reviewsData}>
      {children}
    </ReviewsContext.Provider>
  )
}
