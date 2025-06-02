import React, { useState } from 'react'
import { Heart, Calendar } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useReviewsContext } from '../context/ReviewsContext'
import { scaleRatingTo10, renderStarsFromRating100 } from '../utils/ratingUtils.jsx' // DODANO

const CommunityReviews = ({ movieId = null, movieTitle = null }) => {
  const [likedReviews, setLikedReviews] = useState(new Set())
  const { settings } = useSettings()
  const { reviews, likeReview } = useReviewsContext()

  const handleLike = (reviewId) => {
    setLikedReviews(prev => {
      const newLiked = new Set(prev)
      if (newLiked.has(reviewId)) {
        newLiked.delete(reviewId)
      } else {
        newLiked.add(reviewId)
        likeReview(reviewId)
      }
      return newLiked
    })
  }

  // Filtrowanie recenzji
  let filteredReviews = reviews

  if (movieId && movieTitle) {
    filteredReviews = reviews.filter(review => {
      return review.movieTitle === movieTitle ||
             review.movieTitle.includes(movieTitle.split(' (')[0]) ||
             movieTitle.includes(review.movieTitle.split(' (')[0])
    })
  }

  const sortedReviews = [...filteredReviews].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  const reviewOfTheDay = sortedReviews.find(review => review.isReviewOfTheDay) || 
                         sortedReviews[0]

  const otherReviews = sortedReviews.filter(review => 
    reviewOfTheDay ? review.id !== reviewOfTheDay.id : true
  ).slice(0, movieId ? 10 : 6)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Dziś'
    if (diffDays === 1) return 'Wczoraj'
    if (diffDays < 7) return `${diffDays} dni temu`
    return date.toLocaleDateString('pl-PL')
  }

  const getTitle = () => {
    if (movieId && movieTitle) {
      return `Recenzje filmu "${movieTitle.split(' (')[0]}"`
    }
    return 'Ostatnie Recenzje'
  }

  const getSubtitle = () => {
    if (movieId && movieTitle) {
      return `${sortedReviews.length} ${sortedReviews.length === 1 ? 'recenzja' : 
              sortedReviews.length < 5 ? 'recenzje' : 'recenzji'}`
    }
    return null
  }

  if (sortedReviews.length === 0) {
    return (
      <section className="community-reviews">
        <div className="reviews-container">
          <h2 className="section-title">{getTitle()}</h2>
          <div className="empty-reviews-state">
            <div className="empty-icon">📝</div>
            <h3>
              {movieId ? 'Brak recenzji dla tego filmu' : 'Brak recenzji'}
            </h3>
            <p>
              {movieId 
                ? 'Nikt jeszcze nie napisał recenzji tego filmu. Bądź pierwszy!' 
                : 'Jeszcze nikt nie napisał recenzji. Bądź pierwszy!'
              }
            </p>
            <div className="empty-hint">
              Przejdź do <strong>Rynek zleceń</strong> i napisz swoją pierwszą recenzję.
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="community-reviews">
      <div className="reviews-container">
        <div className="reviews-header">
          <h2 className="section-title">{getTitle()}</h2>
          {getSubtitle() && (
            <p className="section-subtitle">{getSubtitle()}</p>
          )}
        </div>
        
        {/* Featured Review */}
        {reviewOfTheDay && (
          <div className="review-of-the-day">
            <div className="review-badge">
              {movieId ? '⭐ Wyróżniona Recenzja' : '⭐ Najnowsza Recenzja'}
            </div>
            <div 
              className="review-card featured"
              style={{
                transform: settings.reduceMotion ? 'none' : undefined,
                transition: settings.reduceMotion ? 'none' : undefined
              }}
            >
              <div className="review-header">
                <div className="author-info">
                  <span className="avatar">{reviewOfTheDay.avatar}</span>
                  <div>
                    <div className="author-name">{reviewOfTheDay.authorName}</div>
                    {!movieId && (
                      <div className="movie-title-small">recenzuje: {reviewOfTheDay.movieTitle}</div>
                    )}
                    <div className="review-date">
                      <Calendar size={12} />
                      {formatDate(reviewOfTheDay.createdAt)}
                    </div>
                  </div>
                </div>
                {/* ZMIENIONO: Nowy system gwiazdek */}
                <div className="review-rating">
                  {renderStarsFromRating100(reviewOfTheDay.rating, 18)}
                  <div className="rating-info">
                    <span className="rating-number-100">{reviewOfTheDay.rating}/100</span>
                    <span className="rating-number-10">({scaleRatingTo10(reviewOfTheDay.rating)}/10)</span>
                  </div>
                </div>
              </div>
              
              <p className="review-text">{reviewOfTheDay.reviewText}</p>
              
              <div className="review-actions">
                <button 
                  className={`like-btn ${likedReviews.has(reviewOfTheDay.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(reviewOfTheDay.id)}
                  style={{
                    transition: settings.reduceMotion ? 'none' : undefined
                  }}
                >
                  <Heart 
                    size={16} 
                    fill={likedReviews.has(reviewOfTheDay.id) ? "#ff6b35" : "none"}
                    color="#ff6b35"
                  />
                  <span>{reviewOfTheDay.likes + (likedReviews.has(reviewOfTheDay.id) ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other Reviews */}
        {otherReviews.length > 0 && (
          <div className="other-reviews">
            <h3 className="subsection-title">
              {movieId ? 'Wszystkie Recenzje' : 'Więcej Recenzji'}
              <span className="reviews-count">({otherReviews.length})</span>
            </h3>
            <div className="reviews-grid">
              {otherReviews.map(review => (
                <div 
                  key={review.id} 
                  className="review-card"
                  style={{
                    transform: settings.reduceMotion ? 'none' : undefined,
                    transition: settings.reduceMotion ? 'none' : undefined
                  }}
                >
                  <div className="review-header">
                    <div className="author-info">
                      <span className="avatar">{review.avatar}</span>
                      <div>
                        <div className="author-name">{review.authorName}</div>
                        {!movieId && (
                          <div className="movie-title-small">{review.movieTitle}</div>
                        )}
                        <div className="review-date">
                          <Calendar size={12} />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    {/*  */}
                    <div className="review-rating">
                      {renderStarsFromRating100(review.rating, 16)}
                      <div className="rating-info-small">
                        <span className="rating-number-small">{review.rating}/100</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="review-text">
                    {review.reviewText.length > (movieId ? 200 : 150)
                      ? `${review.reviewText.substring(0, movieId ? 200 : 150)}...` 
                      : review.reviewText
                    }
                  </p>
                  
                  <div className="review-actions">
                    <button 
                      className={`like-btn ${likedReviews.has(review.id) ? 'liked' : ''}`}
                      onClick={() => handleLike(review.id)}
                      style={{
                        transition: settings.reduceMotion ? 'none' : undefined
                      }}
                    >
                      <Heart 
                        size={14} 
                        fill={likedReviews.has(review.id) ? "#ff6b35" : "none"}
                        color="#ff6b35"
                      />
                      <span>{review.likes + (likedReviews.has(review.id) ? 1 : 0)}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!movieId && (
          <div className="reviews-cta">
            <h3>Chcesz dodać swoją recenzję?</h3>
            <p>Przejdź do Rynku zleceń i podziel się swoją opinią o filmach!</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CommunityReviews
