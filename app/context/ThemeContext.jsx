import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { saveTheme, loadTheme } from '../../utils/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const loadAppTheme = async () => {
      const savedTheme = await loadTheme();
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };

    loadAppTheme();

    // ✅ Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  const isDarkMode = theme === 'dark';

  const themeStyles = isDarkMode
    ? {
        backgroundColor: '#121212',
        textColor: '#fff',
        headerColor: '#1f1f1f',
        headerTextColor: '#bb86fc',
      }
    : {
        backgroundColor: '#f5f5f5',
        textColor: '#000',
        headerColor: '#6200ee',
        headerTextColor: '#fff',
      };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeStyles, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
