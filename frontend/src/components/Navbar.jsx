import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className='bg-gray-800 text-white p-4 flex justify-between'>
      <div className='flex items-center gap-4'>
        <Link to='/' className='font-bold'>
          Aetherium
        </Link>
        <Link to='/tasks' className='hover:underline'>
          Home
        </Link>
        <Link to='/survey' className='hover:underline'>
          Survey
        </Link>
        <Link to='/agent-survey' className='hover:underline'>
          SurveyBOT
        </Link>
        <Link to='/activities' className='hover:underline'>
          Tracker
        </Link>
        <Link to='/screen-time' className='hover:underline'>
          Screen time
        </Link>
        <Link to='/feedback' className='hover:underline'>
          Feedback
        </Link>
      </div>
      <div>
        {user ? (
          <div className='flex items-center gap-4'>
            <span>{user.username}</span>
            {/* <ThemeToggle /> */}
            <button
              onClick={handleLogout}
              className='bg-red-500 px-3 py-1 rounded'
            >
              Logout
            </button>
          </div>
        ) : (
          <div className='flex gap-2'>
            <Link to='/login' className='hover:underline'>
              Login
            </Link>
            <Link to='/signup' className='ml-2 hover:underline'>
              Signup
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
