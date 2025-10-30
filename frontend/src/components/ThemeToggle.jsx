import React from 'react';
import { useTheme } from '../hooks/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="swap swap-rotate ml-4">
      <input 
        type="checkbox" 
        onChange={toggleTheme}
        checked={theme === 'dark'}
        className="theme-controller"
        value="dark"
      />
      
      <div className="swap-off fill-current h-6 w-6 flex items-center justify-center font-bold text-lg">
        L
      </div>
      
      <div className="swap-on fill-current h-6 w-6 flex items-center justify-center font-bold text-lg">
        D
      </div>
      
    </label>
  );
};

export default ThemeToggle;

