import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Settings from './Settings'
import { LoginModal, RegisterModal } from './AuthModals'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const handleLogout = () => {
    logout()
    // Redirect to home if on protected page
    if (window.location.pathname === '/review-marketplace' || window.location.pathname === '/order-review') {
      window.location.href = '/'
    }
  }

  const switchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const switchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const closeModals = () => {
    setShowLoginModal(false)
    setShowRegisterModal(false)
  }

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="desktop-text">Desktop</span>
            <span className="logo-text">MovieRate</span>
          </Link>
          
          <nav className="nav-menu">
            <Link to="/tv-shows" className="nav-link">TV Shows</Link>
            <Link to="/movies" className="nav-link">Movies</Link>
            {isAuthenticated && (
              <Link to="/review-marketplace" className="nav-link">Review Marketplace</Link>
            )}
            {isAuthenticated && (
              <Link to="/order-review" className="nav-link">Order Review</Link>
            )}
          </nav>
          
          <div className="header-actions">
            <Settings />
            
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <span className="user-avatar">{user.avatar}</span>
                  <span className="user-name">{user.username}</span>
                </div>
                <button 
                  className="btn-logout"
                  onClick={handleLogout}
                  title="Wyloguj się"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="btn-signin"
                  onClick={() => setShowLoginModal(true)}
                >
                  Sign In
                </button>
                <button 
                  className="btn-start"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Start Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={closeModals}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={closeModals}
        onSwitchToLogin={switchToLogin}
      />
    </>
  )
}

export default Header
