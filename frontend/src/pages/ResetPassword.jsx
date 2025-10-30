import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/auth/reset-password/${token}`, {
        password,
      });
      toast.success(res.data.message || 'Password reset successful');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.log(err.message);
      const errMsg = err.response?.data?.message || 'Password reset failed';
      toast.error(errMsg);
    }
  };

  return (
    <div className='max-w-md mx-auto p-6'>
      <h2 className='text-xl font-bold mb-4'>Reset Password</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <input
          type='password'
          name='password'
          placeholder='Enter new password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='p-2 border rounded'
          required
        />
        <button className='bg-green-600 text-white px-3 py-2 rounded'>
          Reset Password
        </button>
      </form>
    </div>
  );
}
