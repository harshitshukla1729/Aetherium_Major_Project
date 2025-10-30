import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'Reset link sent! Check your email.');
      setEmail('');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <div className='max-w-md mx-auto p-6'>
      <h2 className='text-xl font-bold mb-4'>Forgot Password</h2>

      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <input
          type='email'
          name='email'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='p-2 border rounded'
          required
        />
        <button className='bg-blue-600 text-white px-3 py-2 rounded'>
          Send Reset Link
        </button>
      </form>

      {/* 🔹 Back to Login Button */}
      <div className='mt-4 text-center'>
        <button
          onClick={() => navigate('/login')}
          className='text-sm text-gray-600 hover:text-blue-600 underline'
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
