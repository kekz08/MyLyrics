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
        // Enhanced Dark theme
        backgroundColor: '#1A1A1A',
        surfaceColor: '#242424',
        cardColor: '#2A2A2A',
        textColor: '#FFFFFF',
        secondaryTextColor: '#CCCCCC',
        headerColor: '#2D1B69',
        headerTextColor: '#E0B0FF',
        primaryColor: '#B388FF',
        accentColor: '#00E5FF',
        errorColor: '#FF5C8D',
        borderColor: '#404040',
        shadowColor: '#000000',
        inputBackground: '#333333',
        buttonColor: '#B388FF',
        buttonTextColor: '#1A1A1A',
        dividerColor: '#404040',
        rippleColor: 'rgba(179, 136, 255, 0.2)',
        placeholderColor: '#888888'
      }
    : {
        // Enhanced Light theme
        backgroundColor: '#F8F9FF',
        surfaceColor: '#FFFFFF',
        cardColor: '#FFFFFF',
        textColor: '#1A1A1A',
        secondaryTextColor: '#666666',
        headerColor: '#5B21B6',
        headerTextColor: '#FFFFFF',
        primaryColor: '#6200EE',
        accentColor: '#03DAC6',
        errorColor: '#DC2626',
        borderColor: '#E5E7EB',
        shadowColor: '#000000',
        inputBackground: '#FFFFFF',
        buttonColor: '#6200EE',
        buttonTextColor: '#FFFFFF',
        dividerColor: '#E5E7EB',
        rippleColor: 'rgba(98, 0, 238, 0.1)',
        placeholderColor: '#9CA3AF'
      };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeStyles, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
