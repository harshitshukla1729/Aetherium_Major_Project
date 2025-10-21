import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Aetherium (Final Year Major Project)</h1>
      <p className="mb-4">This project helps plan extra-curricular activities for Internet/Mobile Addicts.</p>
      <div className="flex gap-4">
        <Link to="/signup" className="bg-blue-500 px-4 py-2 rounded text-white">Signup</Link>
        <Link to="/login" className="bg-green-500 px-4 py-2 rounded text-white">Login</Link>
      </div>
    </div>
  )
}
