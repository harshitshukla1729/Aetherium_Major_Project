import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

export default function HomePage() {
  return (
    <div className="flex flex-col items-center p-8 mt-10">
      <h1 className="text-3xl font-bold text-center">
        Welcome to Aetherium (Final Year Mini Project)
      </h1>
      
      <p className="text-lg text-gray-600 mt-2 text-center">
        This project helps plan extra-curricular activities for Internet/Mobile Addicts.
      </p>
      <div className="flex gap-4 mt-6">
        <Link 
          to="/signup" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-lg"
        >
          Signup
        </Link>
        <Link 
          to="/login" 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded text-lg"
        >
          Login
        </Link>
      </div>

      <Link 
        to="/survey" 
        className="mt-8 text-xl font-semibold text-blue-600 hover:underline"
      >
        Take a Survey now!
      </Link>
      
    </div>
  );
}