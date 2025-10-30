import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth(); // get user from custom hook

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>
        Welcome to Aetherium (Final Year Major Project)
      </h1>
      <p className='mb-4'>
        This project helps plan extra-curricular activities for Internet/Mobile Addicts.
      </p>

      <div className='flex gap-4 items-center'>
        {user ? (
          <>
            <p className='text-gray-700'>
              Hello, <span className='font-semibold'>{user.username}</span> 👋
            </p>
            <Link
              to='/tasks'
              className='bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-700 transition'
            >
              Go to Tasks
            </Link>
          </>
        ) : (
          <>
            <Link
              to='/signup'
              className='bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition'
            >
              Signup
            </Link>
            <Link
              to='/login'
              className='bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600 transition'
            >
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
