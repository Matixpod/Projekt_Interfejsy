import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Settings from './Settings' // ZOSTAJE
// import ThemeToggle from './ThemeToggle' // USUNIĘTO
import { LoginModal, RegisterModal } from './AuthModals'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
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

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo" onClick={handleLinkClick}>
            <span className="desktop-text">Desktop</span>
            <span className="logo-text">MovieRate</span>
          </Link>
          
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link 
              to="/tv-shows" 
              className="nav-link"
              onClick={handleLinkClick}
            >
              TV Shows
            </Link>
            <Link 
              to="/movies" 
              className="nav-link"
              onClick={handleLinkClick}
            >
              Movies
            </Link>
            {isAuthenticated && (
              <Link 
                to="/review-marketplace" 
                className="nav-link"
                onClick={handleLinkClick}
              >
                Review Marketplace
              </Link>
            )}
            {isAuthenticated && (
              <Link 
                to="/order-review" 
                className="nav-link"
                onClick={handleLinkClick}
              >
                Order Review
              </Link>
            )}

            <div className="mobile-user-section">
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    <span className="user-avatar">{user.avatar}</span>
                    <span className="user-name">{user.username}</span>
                  </div>
                  <button 
                    className="mobile-logout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Wyloguj się
                  </button>
                </>
              ) : (
                <div className="mobile-auth-section">
                  <button 
                    className="btn-signin mobile"
                    onClick={() => {
                      setShowLoginModal(true)
                      handleLinkClick()
                    }}
                  >
                    Sign In
                  </button>
                  <button 
                    className="btn-start mobile"
                    onClick={() => {
                      setShowRegisterModal(true)
                      handleLinkClick()
                    }}
                  >
                    Start Free
                  </button>
                </div>
              )}
            </div>
          </nav>
          
          {/* ZAKTUALIZOWANE: Desktop Actions - USUNIĘTO ThemeToggle */}
          <div className="header-actions desktop-only">
            <Settings /> {/* TYLKO SETTINGS */}
            
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

        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </header>

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
