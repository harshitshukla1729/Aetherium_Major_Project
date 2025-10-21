import React, { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Signup({ setUser }) {
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/signup', form)
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('username', res.data.user?.username || form.username)
        setUser({ username: res.data.user?.username || form.username })
        navigate('/survey')
      } else {
        // some controllers return message only; attempt login by redirect
        navigate('/login')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Signup</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="p-2 border rounded" required />
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} className="p-2 border rounded" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="p-2 border rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="p-2 border rounded" required />
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Signup</button>
      </form>
    </div>
  )
}
