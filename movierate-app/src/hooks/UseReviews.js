import { useState, useEffect } from 'react'

const useReviews = () => {
  const [reviews, setReviews] = useState(() => {
    // Pobierz dane z localStorage przy inicjalizacji
    const savedReviews = localStorage.getItem('movierate-reviews')
    return savedReviews ? JSON.parse(savedReviews) : []
  })

  // Zapisz do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('movierate-reviews', JSON.stringify(reviews))
  }, [reviews])

  const addReview = (newReview) => {
    const review = {
      ...newReview,
      id: Date.now(), // Prosty sposób generowania ID
      createdAt: new Date().toISOString(),
      likes: 0,
      isReviewOfTheDay: false
    }
    
    // Ustaw nową recenzję jako "Review of the Day"
    setReviews(prev => {
      const updatedReviews = prev.map(r => ({ ...r, isReviewOfTheDay: false }))
      return [...updatedReviews, { ...review, isReviewOfTheDay: true }]
    })
    
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
          ? { ...review, likes: review.likes + 1 }
          : review
      )
    )
  }

  const hasUserReviewedOrder = (orderId, authorName) => {
    return reviews.some(review => 
      review.orderId === orderId && review.authorName === authorName
    )
  }

  return {
    reviews,
    addReview,
    updateReview,
    deleteReview,
    likeReview,
    hasUserReviewedOrder
  }
}

export default useReviews
