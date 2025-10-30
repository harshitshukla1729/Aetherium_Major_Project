import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.user?.username || 'User');
        setUser({ username: res.data.user?.username || 'User' });
        toast.success('Login successful! Redirecting to tasks...');
        navigate('/tasks');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    }
  };

  return (
    <div className='max-w-md mx-auto p-6'>
      <h2 className='text-xl font-bold mb-4'>Login</h2>

      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <input
          name='email'
          type='email'
          placeholder='Email'
          value={form.email}
          onChange={handleChange}
          className='p-2 border rounded'
          required
        />
        <input
          name='password'
          type='password'
          placeholder='Password'
          value={form.password}
          onChange={handleChange}
          className='p-2 border rounded'
          required
        />
        <button className='bg-green-600 text-white px-3 py-2 rounded'>
          Login
        </button>

        {/* 🔹 Forgot Password Link */}
        <div className='text-right mt-2'>
          <Link
            to='/forgot-password'
            className='text-sm text-blue-600 hover:underline'
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
}
