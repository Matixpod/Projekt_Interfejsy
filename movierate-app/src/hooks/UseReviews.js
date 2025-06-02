import { useState, useEffect } from 'react'

const useReviews = () => {
  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem('movierate-reviews')
    return savedReviews ? JSON.parse(savedReviews) : []
  })

  useEffect(() => {
    localStorage.setItem('movierate-reviews', JSON.stringify(reviews))
  }, [reviews])

  const addReview = (newReview, updateOrderCallback = null) => {
    const review = {
      ...newReview,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isReviewOfTheDay: false
    }
    
    // Ustaw nową recenzję jako "Review of the Day"
    setReviews(prev => {
      const updatedReviews = prev.map(r => ({ ...r, isReviewOfTheDay: false }))
      return [...updatedReviews, { ...review, isReviewOfTheDay: true }]
    })
    
    // DODANO: Wywołaj callback do aktualizacji zlecenia
    if (updateOrderCallback && newReview.orderId) {
      updateOrderCallback(newReview.orderId)
    }
    
    return review
  }

  const updateReview = (reviewId, updates) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId ? { ...review, ...updates } : review
      )
    )
  }

  const deleteReview = (reviewId) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId))
  }

  const likeReview = (reviewId) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, likes: review.likes }
          : review
      )
    )
  }

  const hasUserReviewedOrder = (orderId, authorName) => {
    return reviews.some(review => 
      review.orderId === orderId && review.authorName === authorName
    )
  }

  // DODANO: Funkcja do liczenia recenzji dla zlecenia
  const getReviewCountForOrder = (orderId) => {
    return reviews.filter(review => review.orderId === orderId).length
  }

  return {
    reviews,
    addReview,
    updateReview,
    deleteReview,
    likeReview,
    hasUserReviewedOrder,
    getReviewCountForOrder // DODANO
  }
}

export default useReviews
