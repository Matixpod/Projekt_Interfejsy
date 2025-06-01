// Przeskaluj ocenę z 1-100 do 1-10
export const scaleRatingTo10 = (rating100) => {
  return Math.max(1, Math.min(10, Math.round(rating100 / 10)))
}

// Konwertuj ocenę 1-10 na strukturę gwiazdek
export const ratingToStars = (rating10) => {
  const stars = []
  const fullStars = Math.floor(rating10 / 2)
  const hasHalfStar = (rating10 % 2) === 1
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push('full')
    } else if (i === fullStars && hasHalfStar) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }
  
  return stars
}

// Bezpośrednia konwersja z 1-100 do gwiazdek
export const rating100ToStars = (rating100) => {
  const rating10 = scaleRatingTo10(rating100)
  return ratingToStars(rating10)
}

// Renderuj gwiazdki jako JSX komponenty
export const renderStarsFromRating100 = (rating100, size = 16) => {
  const stars = rating100ToStars(rating100)
  const rating10 = scaleRatingTo10(rating100)
  
  return (
    <div className="stars-display" title={`${rating100}/100 (${rating10}/10)`}>
      {stars.map((starType, index) => (
        <div key={index} className="star-wrapper">
          {starType === 'full' && (
            <svg width={size} height={size} viewBox="0 0 24 24" className="star-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ffd700" stroke="#ffd700"/>
            </svg>
          )}
          {starType === 'half' && (
            <div className="star-half-container">
              <svg width={size} height={size} viewBox="0 0 24 24" className="star-empty">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="#ddd"/>
              </svg>
              <svg width={size} height={size} viewBox="0 0 24 24" className="star-half">
                <defs>
                  <clipPath id={`half-${index}`}>
                    <rect x="0" y="0" width="12" height="24"/>
                  </clipPath>
                </defs>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ffd700" stroke="#ffd700" clipPath={`url(#half-${index})`}/>
              </svg>
            </div>
          )}
          {starType === 'empty' && (
            <svg width={size} height={size} viewBox="0 0 24 24" className="star-empty">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="#ddd"/>
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
