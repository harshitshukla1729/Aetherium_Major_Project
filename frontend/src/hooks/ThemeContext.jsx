import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
   
    const localTheme = localStorage.getItem('theme');
    if (localTheme) {
      return localTheme;
    }
    
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

   
    return 'light';
  });

  useEffect(() => {
  
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.remove('light');
      html.classList.add('dark');
      
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      
      html.setAttribute('data-theme', 'emerald'); 
    }
    
   
    localStorage.setItem('theme', theme);
  }, [theme]); 

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

