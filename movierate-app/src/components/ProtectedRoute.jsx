import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="protected-route-warning">
        <div className="warning-container">
          <h2>🔒 Dostęp ograniczony</h2>
          <p>Ta strona jest dostępna tylko dla zalogowanych użytkowników.</p>
          <div className="warning-actions">
            <p>Zaloguj się lub załóż konto, aby uzyskać dostęp.</p>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
