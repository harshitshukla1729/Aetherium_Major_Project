import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold">Aetherium</Link>
        <Link to="/survey" className="hover:underline">Survey</Link>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span>{user.username}</span>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="ml-2 hover:underline">Signup</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
