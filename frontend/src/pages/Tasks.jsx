// src/pages/Tasks.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Tasks() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className='p-6 max-w-3xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4'>Your Tasks</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div
          onClick={() => navigate('/survey')}
          className='cursor-pointer p-4 bg-white rounded-lg shadow hover:shadow-lg transition'
        >
          <h3 className='font-semibold text-lg mb-2'>📝 Take Survey</h3>
          <p className='text-gray-600 text-sm'>Complete your wellness survey</p>
        </div>

        {/* Example placeholder for future task cards */}
        <div className='p-4 bg-white rounded-lg shadow opacity-60'>
          <h3 className='font-semibold text-lg mb-2'>Coming Soon</h3>
          <p className='text-gray-500 text-sm'>
            More activities will be added here
          </p>
        </div>
      </div>
    </div>
  );
}
