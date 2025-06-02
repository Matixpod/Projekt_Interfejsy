import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { SettingsProvider } from './context/SettingsContext'
import { OrdersProvider } from './context/OrdersContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { AuthProvider } from './context/AuthContext' // 
import Header from './components/Header'
import HomePage from './pages/HomePage'
import TVShowsPage from './pages/TVShowsPage'
import MoviesPage from './pages/MoviesPage'
import DetailPage from './pages/DetailPage'
import OrderReviewPage from './pages/OrderReviewPage'
import ReviewMarketplace from './pages/ReviewMarketplace'
import ProtectedRoute from './components/ProtectedRoute' // 

function App() {
  return (
    <SettingsProvider>
      <AuthProvider> {/*  - AuthProvider musi być wewnątrz SettingsProvider */}
        <OrdersProvider>
          <ReviewsProvider>
            <Router>
              <div className="app">
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/tv-shows" element={<TVShowsPage />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/movie/:id" element={<DetailPage type="movie" />} />
                  <Route path="/tv-show/:id" element={<DetailPage type="tvshow" />} />
                  
                  {/* CHRONIONE ROUTY */}
                  <Route 
                    path="/order-review" 
                    element={
                      <ProtectedRoute>
                        <OrderReviewPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/review-marketplace" 
                    element={
                      <ProtectedRoute>
                        <ReviewMarketplace />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </div>
            </Router>
          </ReviewsProvider>
        </OrdersProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}

export default App
