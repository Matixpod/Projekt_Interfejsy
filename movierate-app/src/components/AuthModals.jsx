import React, { useState } from 'react'
import { X, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

// Modal Logowania
export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login } = useAuth()
  const { settings } = useSettings()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      if (!formData.username.trim()) {
        throw new Error('Nazwa użytkownika jest wymagana')
      }
      if (!formData.password) {
        throw new Error('Hasło jest wymagane')
      }

      login(formData.username.trim(), formData.password)
      setFormData({ username: '', password: '' })
      onClose()
      
    } catch (error) {
      setErrors({ general: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="auth-modal-overlay" onClick={onClose} />
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>Zaloguj się</h2>
          <button className="auth-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="auth-error">{errors.general}</div>
          )}

          <div className="auth-form-group">
            <label htmlFor="username">
              <User size={16} />
              Nazwa użytkownika
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Wprowadź nazwę użytkownika"
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">
              <Lock size={16} />
              Hasło
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Wprowadź hasło"
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting}
            style={{
              transition: settings.reduceMotion ? 'none' : undefined
            }}
          >
            {isSubmitting ? 'Logowanie...' : (
              <>
                <LogIn size={16} />
                Zaloguj się
              </>
            )}
          </button>

          <div className="auth-switch">
            Nie masz konta?{' '}
            <button 
              type="button" 
              className="auth-switch-btn"
              onClick={onSwitchToRegister}
            >
              Zarejestruj się
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

// Modal Rejestracji
export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register } = useAuth()
  const { settings } = useSettings()
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Walidacja
      if (!formData.username.trim()) {
        throw new Error('Nazwa użytkownika jest wymagana')
      }
      if (formData.username.length < 3) {
        throw new Error('Nazwa użytkownika musi mieć co najmniej 3 znaki')
      }
      if (!formData.email.trim()) {
        throw new Error('Email jest wymagany')
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error('Nieprawidłowy format email')
      }
      if (!formData.password) {
        throw new Error('Hasło jest wymagane')
      }
      if (formData.password.length < 6) {
        throw new Error('Hasło musi mieć co najmniej 6 znaków')
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Hasła nie są identyczne')
      }

      register(formData.username.trim(), formData.password, formData.email.trim())
      setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      onClose()
      
    } catch (error) {
      setErrors({ general: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="auth-modal-overlay" onClick={onClose} />
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>Zarejestruj się</h2>
          <button className="auth-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="auth-error">{errors.general}</div>
          )}

          <div className="auth-form-group">
            <label htmlFor="reg-username">
              <User size={16} />
              Nazwa użytkownika
            </label>
            <input
              id="reg-username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Minimum 3 znaki"
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-email">
              <Mail size={16} />
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="twoj@email.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-password">
              <Lock size={16} />
              Hasło
            </label>
            <input
              id="reg-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Minimum 6 znaków"
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-confirm-password">
              <Lock size={16} />
              Potwierdź hasło
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Powtórz hasło"
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting}
            style={{
              transition: settings.reduceMotion ? 'none' : undefined
            }}
          >
            {isSubmitting ? 'Rejestracja...' : (
              <>
                <UserPlus size={16} />
                Zarejestruj się
              </>
            )}
          </button>

          <div className="auth-switch">
            Masz już konto?{' '}
            <button 
              type="button" 
              className="auth-switch-btn"
              onClick={onSwitchToLogin}
            >
              Zaloguj się
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
