import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

      {message && <div className="bg-green-100 text-green-700 p-2 mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button className="bg-blue-600 text-white px-3 py-2 rounded">
          Send Reset Link
        </button>
      </form>

      {/* 🔹 Back to Login Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-gray-600 hover:text-blue-600 underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
