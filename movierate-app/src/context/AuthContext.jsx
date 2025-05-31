import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('movierate-user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('movierate-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('movierate-user')
    }
  }, [user])

  const register = (username, password, email) => {
    const users = JSON.parse(localStorage.getItem('movierate-users') || '[]')
    
    // Sprawdź czy username już istnieje
    if (users.find(u => u.username === username)) {
      throw new Error('Użytkownik o takiej nazwie już istnieje')
    }
    
    // Sprawdź czy email już istnieje
    if (users.find(u => u.email === email)) {
      throw new Error('Użytkownik z tym emailem już istnieje')
    }
    
    // Dodaj nowego użytkownika
    const newUser = { 
      id: Date.now(),
      username, 
      password, 
      email,
      createdAt: new Date().toISOString(),
      avatar: getRandomAvatar()
    }
    users.push(newUser)
    localStorage.setItem('movierate-users', JSON.stringify(users))
    
    // Automatycznie zaloguj
    setUser({ 
      id: newUser.id,
      username: newUser.username, 
      email: newUser.email,
      avatar: newUser.avatar 
    })
  }

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('movierate-users') || '[]')
    const foundUser = users.find(u => u.username === username && u.password === password)
    
    if (!foundUser) {
      throw new Error('Nieprawidłowa nazwa użytkownika lub hasło')
    }
    
    setUser({ 
      id: foundUser.id,
      username: foundUser.username, 
      email: foundUser.email,
      avatar: foundUser.avatar 
    })
  }

  const logout = () => {
    setUser(null)
  }

  const getRandomAvatar = () => {
    const avatars = ['👤', '🎭', '🎬', '🍿', '⭐', '🎪', '🎨', '🎯', '🎲', '🎮', '🎸', '🎺']
    return avatars[Math.floor(Math.random() * avatars.length)]
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      register,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}
