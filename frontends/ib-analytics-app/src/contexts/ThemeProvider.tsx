import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useState<'light' | 'dark'>('light');
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

            if (savedTheme) {
                setThemeState(savedTheme);
            } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setThemeState(prefersDark ? 'dark' : 'light');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (!isInitialized) return;

        try {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }, [theme, isInitialized]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            // Only auto-switch if user hasn't manually set a preference
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                setThemeState(e.matches ? 'dark' : 'light');
            }
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        // Fallback for older browsers
        else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);

    const toggleTheme = () => {
        setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const setTheme = (newTheme: 'light' | 'dark') => {
        setThemeState(newTheme);
    };

    const value: ThemeContextType = {
        theme,
        toggleTheme,
        setTheme,
    };

    // Prevent flash of unstyled content
    if (!isInitialized) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
