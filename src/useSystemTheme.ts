import { useState, useEffect } from 'react';

const useSystemTheme = () => {
  // Function to check current dark mode status
  const checkDarkMode = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Default to false if window is not available (e.g., during SSR)
  };

  const [isDarkMode, setIsDarkMode] = useState(checkDarkMode());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Handler to update state when the scheme changes
    const handleChange = (event: { matches: boolean | ((prevState: boolean) => boolean); }) => {
      setIsDarkMode(event.matches);
    };

    // Listen for changes (using addEventListener for modern browsers)
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup the event listener on component unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isDarkMode;
};

export default useSystemTheme;
