import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Survey from './pages/Survey'
import useAuth from './hooks/useAuth'

function  App() {
  const { user, setUser, logout } = useAuth()

  const Protected = ({ children }) => {
    const token = localStorage.getItem('token')
    if (!token) return <Navigate to="/login" />
    return children
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={logout} />
      <div className="container mx-auto mt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/survey" element={
            <Protected>
              <Survey />
            </Protected>
          } />
        </Routes>
      </div>
    </div>
  )
}

export default App
